"""AST-based invariant extractor — parses Python source to detect
state mutations, guard conditions, and synthesizes formal invariant contracts.

Zero LLM calls. Pure abstract syntax tree traversal.
"""

from __future__ import annotations

import ast
import hashlib
import re
from typing import List, Optional, Set, Tuple

from .schemas import (
    ExtractionResult,
    GuardCondition,
    Invariant,
    InvariantType,
    StateMutation,
)


# ---------------------------------------------------------------------------
# Pattern detectors
# ---------------------------------------------------------------------------

# Known anti-pattern keywords that hint at concurrency issues
_CONCURRENCY_KEYWORDS = {"thread", "async", "await", "lock", "mutex", "concurrent"}
_STATE_MUTATION_OPS = {"=", "+=", "-=", "*=", "//=", "**=", "|=", "&=", "^="}
_ZERO_LITERAL_NAMES = {"0", "0.0", "0j"}

# Docstring / comment invariant hints
_INVARIANT_PATTERN = re.compile(
    r"(?:invariant|@invariant|precondition|postcondition|requires|ensures)"
    r"\s*[\(\"\']?\s*(.+?)[\)\"\']?\s*$",
    re.IGNORECASE | re.MULTILINE,
)


def _has_negative_or_zero_guard(node: ast.expr) -> bool:
    """Check if an expression is a comparison against zero or negative."""
    if isinstance(node, ast.Compare):
        for comparator in node.comparators:
            if isinstance(comparator, ast.Constant) and comparator.value in (0, 0.0):
                return True
            if isinstance(comparator, ast.UnaryOp) and isinstance(comparator.operand, ast.Constant):
                if isinstance(comparator.operand.value, (int, float)) and comparator.operand.value >= 0:
                    return True
    return False


def _extract_balance_like_targets(node: ast.expr) -> List[str]:
    """Extract attribute-access patterns that look like balance/state fields."""
    targets = []
    if isinstance(node, ast.Attribute):
        if "balance" in ast.dump(node).lower() or "amount" in ast.dump(node).lower():
            targets.append(ast.unparse(node))
    elif isinstance(node, ast.Subscript):
        inner = ast.unparse(node)
        if "balance" in inner.lower() or "account" in inner.lower() or "ledger" in inner.lower():
            targets.append(inner)
    return targets


# ---------------------------------------------------------------------------
# Main extractor
# ---------------------------------------------------------------------------

class InvariantExtractor(ast.NodeVisitor):
    """Walks a Python AST to extract:
      - State mutations (assignments to mutable fields)
      - Guard conditions (if-checks on balances, amounts, thresholds)
      - Inferred invariant contracts from patterns + docstrings
    """

    def __init__(self, source: str = ""):
        self.source = source
        self.mutations: List[StateMutation] = []
        self.guards: List[GuardCondition] = []
        self.invariants: List[Invariant] = []
        self._current_function: Optional[str] = None
        self._functions_analyzed: Set[str] = set()
        self._inv_counter = 0

    # -- helpers ---------------------------------------------------------------

    def _next_id(self) -> str:
        self._inv_counter += 1
        return f"INV-{self._inv_counter:03d}"

    def _classify_guard(self, expr: str, line: int, func: str) -> Optional[InvariantType]:
        """Infer invariant type from a guard expression."""
        expr_lower = expr.lower()
        if any(kw in expr_lower for kw in ("balance", "amount", ">=", "<=", "< 0", "> 0")):
            if "0" in expr and ("<" in expr or ">" in expr):
                return InvariantType.BOUNDARY
        if "==" in expr or "total" in expr_lower or "sum" in expr_lower:
            return InvariantType.CONSERVATION
        return None

    # -- visitors --------------------------------------------------------------

    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        self._current_function = node.name
        self._functions_analyzed.add(node.name)

        # Extract docstring hints
        if node.body and isinstance(node.body[0], ast.Expr) and isinstance(node.body[0].value, ast.Constant):
            docstring = node.body[0].value.value or ""
            for m in _INVARIANT_PATTERN.finditer(docstring):
                hint = m.group(1).strip()
                self.invariants.append(
                    Invariant(
                        id=self._next_id(),
                        type=InvariantType.BOUNDARY,
                        label=hint[:80],
                        description=hint,
                        formal_expr=hint,
                        source_line=node.lineno,
                        source_function=node.name,
                    )
                )
        self.generic_visit(node)

    visit_AsyncFunctionDef = visit_FunctionDef

    def visit_If(self, node: ast.If) -> None:
        expr_str = ast.unparse(node.test)
        self.guards.append(
            GuardCondition(
                expression=expr_str,
                line=node.lineno,
                function=self._current_function or "<module>",
            )
        )
        inv_type = self._classify_guard(expr_str, node.lineno, self._current_function or "<module>")
        if inv_type:
            self.invariants.append(
                Invariant(
                    id=self._next_id(),
                    type=inv_type,
                    label=f"Guard: {expr_str[:60]}",
                    description=f"Condition '{expr_str}' must hold at line {node.lineno}",
                    formal_expr=expr_str,
                    source_line=node.lineno,
                    source_function=self._current_function,
                )
            )
        self.generic_visit(node)

    def visit_Assign(self, node: ast.Assign) -> None:
        for target in node.targets:
            target_str = ast.unparse(target)
            if "self" in target_str or "balance" in target_str.lower():
                self.mutations.append(
                    StateMutation(
                        target=target_str,
                        operator="=",
                        value_expr=ast.unparse(node.value),
                        line=node.lineno,
                        function=self._current_function or "<module>",
                    )
                )
        self.generic_visit(node)

    def visit_AugAssign(self, node: ast.AugAssign) -> None:
        target_str = ast.unparse(node.target)
        op = type(node.op).__name__
        if "self" in target_str or "balance" in target_str.lower():
            self.mutations.append(
                StateMutation(
                    target=target_str,
                    operator=op,
                    value_expr=ast.unparse(node.value),
                    line=node.lineno,
                    function=self._current_function or "<module>",
                )
            )

        # Detect balance-boundary mutations: balance -= amount
        if any(kw in target_str.lower() for kw in ("balance", "amount")):
            self.invariants.append(
                Invariant(
                    id=self._next_id(),
                    type=InvariantType.BOUNDARY,
                    label=f"Non-negative: {target_str}",
                    description=f"'{target_str}' must never go below zero after '{op}' at line {node.lineno}",
                    formal_expr=f"{target_str} >= 0",
                    source_line=node.lineno,
                    source_function=self._current_function,
                )
            )
        self.generic_visit(node)

    def visit_AnnAssign(self, node: ast.AnnAssign) -> None:
        if node.target and node.value:
            target_str = ast.unparse(node.target)
            if "self" in target_str:
                self.mutations.append(
                    StateMutation(
                        target=target_str,
                        operator="=",
                        value_expr=ast.unparse(node.value),
                        line=node.lineno,
                        function=self._current_function or "<module>",
                    )
                )
        self.generic_visit(node)

    # -- public API ------------------------------------------------------------

    def extract(self, source: str) -> ExtractionResult:
        """Parse Python source and extract invariants, mutations, and guards."""
        source_hash = hashlib.sha256(source.encode()).hexdigest()[:16]
        try:
            tree = ast.parse(source)
        except SyntaxError as exc:
            return ExtractionResult(
                source_hash=source_hash,
            )

        self.mutations.clear()
        self.guards.clear()
        self.invariants.clear()
        self._inv_counter = 0
        self._current_function = None
        self._functions_analyzed.clear()

        self.visit(tree)

        # Add a conservation invariant if we detect at least two mutation targets
        mutation_targets = {m.target for m in self.mutations}
        if len(mutation_targets) >= 2:
            self.invariants.append(
                Invariant(
                    id=self._next_id(),
                    type=InvariantType.CONSERVATION,
                    label="Asset Conservation",
                    description="Sum of all state values must remain constant across mutations",
                    formal_expr="Σ(state_values_post) == Σ(state_values_pre)",
                    source_function=self._current_function,
                )
            )

        # Detect concurrency risk from source comments or structure
        source_lower = self.source.lower() if self.source else ""
        if any(kw in source_lower for kw in _CONCURRENCY_KEYWORDS):
            self.invariants.append(
                Invariant(
                    id=self._next_id(),
                    type=InvariantType.CONCURRENCY,
                    label="Thread Safety",
                    description="Concurrent access to shared state must be serialized",
                    formal_expr="∀ t1, t2: execute(t1 ∥ t2) ≡ sequential(t1, t2)",
                    source_function=self._current_function,
                )
            )

        return ExtractionResult(
            invariants=self.invariants,
            mutations=self.mutations,
            guards=self.guards,
            functions_analyzed=len(self._functions_analyzed),
            source_hash=source_hash,
        )


# ---------------------------------------------------------------------------
# Convenience function
# ---------------------------------------------------------------------------

def extract_invariants(source: str) -> ExtractionResult:
    """One-call API: parse source → ExtractionResult."""
    extractor = InvariantExtractor(source)
    return extractor.extract(source)
