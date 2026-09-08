"""SHIPGUARD — Dynamic Attack Synthesizer.

Bridges user-edited invariant contracts (exported from the web dashboard as
plain dicts carrying `id`, `type`, `label`, and a Python-style `expression`)
into runnable assertions that are checked against the real state captured
around a concurrent double-spend attempt.

Example expressions accepted (see `normalize_expression`):

    post_total == pre_total
    post_sender >= 0 and post_receiver >= 0
    post_sender + post_receiver == pre_total
    abs(post_total - pre_total) < 0.01
    min(post_sender, post_receiver) >= 0

Evaluation is deliberately restricted: the expression is compiled with
`ast.parse(..., mode="eval")` against a whitelist of context names, safe
arithmetic/comparison/boolean operators, and a small function allowlist.
No attribute access, no calls outside the allowlist, no names from the
ambient environment — a hostile formula cannot execute arbitrary code.

The frontend (`src/components/shipguard/predicates.ts`) implements the same
tokenizer/shunting-yard/evaluator in TypeScript so the demo UI and this
engine render identical verdicts for identical expressions.
"""

from __future__ import annotations

import ast
import random
import threading
import time
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

from target_service.campus_pay import CampusPay


# ---------------------------------------------------------------------------
# Contract + result schemas (plain dataclasses — no external deps required)
# ---------------------------------------------------------------------------


@dataclass
class Invariant:
    id: str
    type: str
    label: str
    description: str = ""
    expression: str = ""
    target_function: str = "transfer"
    status: str = "standby"


@dataclass
class AttackResult:
    vector: str
    falsified: bool
    state_delta: Dict[str, float] = field(default_factory=dict)
    falsified_invariant_id: Optional[str] = None
    falsified_expression: Optional[str] = None
    evaluation_error: Optional[str] = None
    reproduction_command: Optional[str] = None
    traceback: Optional[str] = None
    exit_code: int = 0


# ---------------------------------------------------------------------------
# Dynamic predicate evaluator (the two-sided bridge)
# ---------------------------------------------------------------------------

_CONTEXT_NAMES = {
    "pre_sender",
    "pre_receiver",
    "pre_total",
    "post_sender",
    "post_receiver",
    "post_total",
    "amount",
}

_SAFE_FUNCS = {
    "abs": abs,
    "min": min,
    "max": max,
    "sum": sum,
    "round": round,
}

_ALLOWED_BINOPS = (ast.Add, ast.Sub, ast.Mult, ast.Div, ast.Mod)
_ALLOWED_CMPOPS = (ast.Eq, ast.NotEq, ast.Lt, ast.LtE, ast.Gt, ast.GtE)
_ALLOWED_UNARYOPS = (ast.Not, ast.USub, ast.UAdd)


def normalize_expression(raw: str) -> str:
    """Canonicalize the notations users actually type into Python syntax."""
    expr = raw.strip()
    # Currency symbols on bare numbers: ₹1,000 / $1,000 → 1000
    for symbol in ("₹", "$"):
        expr = expr.replace(symbol, "")
    expr = expr.replace(",000", "000")
    # Shorthand context aliases
    for alias, canonical in (
        ("pre_sum", "pre_total"),
        ("post_sum", "post_total"),
        ("sender_pre", "pre_sender"),
        ("sender_post", "post_sender"),
        ("receiver_pre", "pre_receiver"),
        ("receiver_post", "post_receiver"),
    ):
        expr = expr.replace(alias, canonical)
    # Unicode math operators → Python
    for raw_op, py_op in (("≥", ">="), ("≤", "<="), ("≠", "!=")):
        expr = expr.replace(raw_op, py_op)
    # Prose keywords → Python boolean operators
    for keyword, py_op in ((" and ", " and "), (" or ", " or "), (" not ", " not ")):
        expr = expr.replace(keyword, py_op)
    return expr.strip()


def evaluate_predicate(expression: str, context: Dict[str, float]) -> bool:
    """Safely compile and evaluate a user invariant expression.

    Returns the Python truthiness of the predicate, or False (with the
    error recorded on the exception) when the expression cannot be
    compiled or evaluated.
    """
    cleaned = normalize_expression(expression)
    if not cleaned:
        raise ValueError("empty predicate")

    tree = ast.parse(cleaned, mode="eval")

    def check(node: ast.AST) -> None:
        if isinstance(node, ast.Expression):
            check(node.body)
        elif isinstance(node, ast.BinOp) and isinstance(node.op, _ALLOWED_BINOPS):
            check(node.left)
            check(node.right)
        elif isinstance(node, ast.UnaryOp) and isinstance(node.op, _ALLOWED_UNARYOPS):
            check(node.operand)
        elif isinstance(node, ast.BoolOp):
            for value in node.values:
                check(value)
        elif isinstance(node, ast.Compare):
            check(node.left)
            if len(node.ops) != len(node.comparators):
                raise ValueError("malformed comparison")
            for op, comparator in zip(node.ops, node.comparators):
                if not isinstance(op, _ALLOWED_CMPOPS):
                    raise ValueError(f"comparison operator not allowed: {type(op).__name__}")
                check(comparator)
        elif isinstance(node, ast.Name):
            if node.id not in _CONTEXT_NAMES and node.id not in ("True", "False"):
                raise ValueError(f"unknown identifier: {node.id}")
        elif isinstance(node, ast.Constant):
            if not isinstance(node.value, (int, float, bool)):
                raise ValueError(f"literal type not allowed: {type(node.value).__name__}")
        elif isinstance(node, ast.Call):
            if not isinstance(node.func, ast.Name) or node.func.id not in _SAFE_FUNCS:
                raise ValueError("function not allowed")
            if node.keywords:
                raise ValueError("keyword arguments not allowed")
            for arg in node.args:
                check(arg)
        elif isinstance(node, (ast.Tuple, ast.List)):
            for elt in node.elts:
                check(elt)
        else:
            raise ValueError(f"expression element not allowed: {type(node).__name__}")

    check(tree)

    safe_globals: Dict[str, Any] = {"__builtins__": {}}
    safe_locals: Dict[str, Any] = {
        **context,
        **_SAFE_FUNCS,
        "True": True,
        "False": False,
    }
    return bool(eval(compile(tree, "<invariant>", "eval"), safe_globals, safe_locals))  # noqa: S307


# ---------------------------------------------------------------------------
# Concurrent fuzzing loop
# ---------------------------------------------------------------------------


def _run_single_attempt(
    initial_balance: float,
    transfer_amount: float,
    concurrency: int,
    jitter_us: int = 0,
) -> Dict[str, float]:
    """One concurrent double-spend attempt; returns the captured context.

    `jitter_us` scatters each worker's start inside the window so the
    interleaving varies across attempts (scheduler fuzzing); with 0 the
    workers start back-to-back after the barrier."""
    service = CampusPay()
    service.balances = {"sender": initial_balance, "receiver": 0.0}

    pre_sender = service.get_balance("sender")
    pre_receiver = service.get_balance("receiver")
    pre_total = service.total_assets()

    barrier = threading.Barrier(concurrency)

    def worker() -> None:
        barrier.wait()
        if jitter_us:
            time.sleep(random.uniform(0, jitter_us) / 1_000_000)
        service.transfer("sender", "receiver", transfer_amount)

    threads = [threading.Thread(target=worker) for _ in range(concurrency)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    return {
        "pre_sender": pre_sender,
        "pre_receiver": pre_receiver,
        "pre_total": pre_total,
        "post_sender": service.get_balance("sender"),
        "post_receiver": service.get_balance("receiver"),
        "post_total": service.total_assets(),
        "amount": transfer_amount,
    }


def execute_adversarial_attack_suite(
    invariants: Optional[List[Invariant]] = None,
    initial_balance: float = 1000.0,
    transfer_amount: float = 1000.0,
    concurrency: int = 2,
    max_attempts: int = 500,
) -> AttackResult:
    """Fuzz the target with concurrent double-spend attempts until an
    active invariant predicate falsifies or attempts are exhausted.

    CPython's GIL makes a single barrier-synchronized run atomic most of
    the time, so the loop hammers the check-then-act window with a forced
    tiny thread-switch interval until the interleaving actually lands
    inside it — which is exactly what property-based adversarial testing
    does. The first falsifying attempt's captured state is returned as
    the counterexample.
    """
    if concurrency < 2:
        raise ValueError("concurrency must be >= 2 to exercise the race window")

    # Default fallback contract set when the dashboard exports none.
    if not invariants:
        invariants = [
            Invariant(
                id="INV-002",
                type="CONSERVATION",
                label="Conservation of In-Flight Assets",
                description="∑(Balances_post) == ∑(Balances_pre)",
                expression="post_total == pre_total",
                target_function="transfer",
            )
        ]

    # Pre-compile/validate every predicate once so a malformed judge
    # expression is reported before any fuzzing starts.
    for inv in invariants:
        expression = inv.expression or "post_total == pre_total"
        try:
            ast.parse(normalize_expression(expression), mode="eval")
        except SyntaxError as err:
            return AttackResult(
                vector="toctou",
                falsified=False,
                evaluation_error=f"[{inv.id}] invalid predicate: {err.msg}",
                exit_code=2,
            )

    import sys

    previous_interval = sys.getswitchinterval()
    # Force rapid thread preemption so the interleaving lands inside the
    # check-then-act window far more often, and scatter worker starts with
    # jitter so the two threads contend inside the critical section.
    sys.setswitchinterval(1e-6)
    try:
        for attempt in range(max_attempts):
            eval_context = _run_single_attempt(
                initial_balance,
                transfer_amount,
                concurrency,
                jitter_us=250,
            )

            for inv in invariants:
                expression = inv.expression or "post_total == pre_total"
                try:
                    passed = evaluate_predicate(expression, eval_context)
                except (SyntaxError, ValueError) as err:
                    return AttackResult(
                        vector="toctou",
                        falsified=False,
                        evaluation_error=f"[{inv.id}] {err}",
                        state_delta=eval_context,
                        exit_code=2,
                    )

                if not passed:
                    phantom_delta = eval_context["post_total"] - eval_context["pre_total"]
                    return AttackResult(
                        vector="toctou",
                        falsified=True,
                        falsified_invariant_id=inv.id,
                        falsified_expression=expression,
                        reproduction_command=f"pytest backend/tests/test_invariants.py -k {inv.id}",
                        traceback=(
                            f"AssertionError: Contract [{inv.id}] Falsified!"
                            f" (attempt {attempt + 1}/{max_attempts})\n"
                            f"  Expression: {expression}\n"
                            f"  Observed State: pre_total={eval_context['pre_total']},"
                            f" post_total={eval_context['post_total']},"
                            f" post_sender={eval_context['post_sender']}\n"
                            f"  Discrepancy: Δ = ₹{phantom_delta:,.2f} balance anomaly"
                        ),
                        exit_code=1,
                        state_delta=eval_context,
                    )
    finally:
        sys.setswitchinterval(previous_interval)

    # All attempts exhausted with every predicate holding.
    eval_context = _run_single_attempt(initial_balance, transfer_amount, concurrency)
    return AttackResult(vector="toctou", falsified=False, state_delta=eval_context)


# ---------------------------------------------------------------------------
# CLI entrypoint — mirrors `python backend/main.py --target ... --json-out ...`
# ---------------------------------------------------------------------------


def main() -> int:
    import argparse
    import json
    import sys

    parser = argparse.ArgumentParser(description="SHIPGUARD dynamic attack synthesizer")
    parser.add_argument(
        "--invariants-json",
        help="JSON file containing the dashboard-exported contract set",
    )
    parser.add_argument("--initial-balance", type=float, default=1000.0)
    parser.add_argument("--transfer-amount", type=float, default=1000.0)
    parser.add_argument("--concurrency", type=int, default=2)
    args = parser.parse_args()

    invariants: Optional[List[Invariant]] = None
    if args.invariants_json:
        with open(args.invariants_json, "r", encoding="utf-8") as fh:
            payload = json.load(fh)
        invariants = [
            Invariant(
                id=item.get("id", "INV-???"),
                type=item.get("type", "CUSTOM"),
                label=item.get("label", ""),
                description=item.get("description", ""),
                expression=item.get("expression", ""),
                target_function=item.get("target_function", "transfer"),
                status=item.get("status", "standby"),
            )
            for item in payload
        ]

    result = execute_adversarial_attack_suite(
        invariants=invariants,
        initial_balance=args.initial_balance,
        transfer_amount=args.transfer_amount,
        concurrency=args.concurrency,
    )

    print(json.dumps(result.__dict__, indent=2))
    return result.exit_code


if __name__ == "__main__":
    import sys

    sys.exit(main())
