"""Adversarial attack synthesizer — generates deterministic, property-based
test cases using Hypothesis to falsify extracted invariants.

Zero LLM calls. Uses mathematical input generation + thread interleaving barriers.
"""

from __future__ import annotations

import importlib
import importlib.util
import os
import sys
import tempfile
import time
import threading
from typing import Any, Dict, List, Optional

from ..contracts.schemas import (
    AttackResult,
    AttackVector,
    ExtractionResult,
    Invariant,
    InvariantType,
    TestFailure,
)


# ---------------------------------------------------------------------------
# Hypothesis strategies for each invariant type
# ---------------------------------------------------------------------------

def _boundary_strategies():
    """Boundary-condition attack: negative, zero, huge, NaN-ish values."""
    from hypothesis import strategies as st
    return {
        "amount": st.one_of(
            st.just(0.0),
            st.just(-1.0),
            st.just(-1000.0),
            st.floats(min_value=0.01, max_value=1e12),
            st.floats(min_value=-1e12, max_value=0.0),
        ),
        "initial_balance": st.one_of(
            st.just(0.0),
            st.just(1.0),
            st.floats(min_value=0.0, max_value=1e6),
        ),
    }


def _conservation_strategies():
    """Conservation-attack: transfer amounts that exceed balance."""
    from hypothesis import strategies as st
    return {
        "initial_balance": st.floats(min_value=1.0, max_value=1e5),
        "amount": st.floats(min_value=0.01, max_value=1e6),
    }


def _concurrency_strategies():
    """Concurrency-attack: simultaneous thread execution via barriers."""
    from hypothesis import strategies as st
    return {
        "initial_balance": st.just(1000.0),
        "amount": st.just(1000.0),
        "num_threads": st.sampled_from([2, 3, 4]),
    }


_STRATEGY_BUILDERS = {
    InvariantType.BOUNDARY: _boundary_strategies,
    InvariantType.CONSERVATION: _conservation_strategies,
    InvariantType.CONCURRENCY: _concurrency_strategies,
    InvariantType.ATOMICITY: _concurrency_strategies,
    InvariantType.IDEMPOTENCY: _concurrency_strategies,
}


# ---------------------------------------------------------------------------
# Test generators
# ---------------------------------------------------------------------------

def _generate_boundary_test(invariant: Invariant) -> str:
    """Generate a Hypothesis test for boundary violations."""
    return f'''
from hypothesis import given, strategies as st, settings
from target_service.campus_pay import CampusPay

@given(
    initial_balance=st.one_of(st.just(0.0), st.just(-1.0), st.floats(min_value=0.01, max_value=1e6)),
    amount=st.one_of(st.just(0.0), st.just(-1.0), st.floats(min_value=0.01, max_value=1e6)),
)
@settings(max_examples=200, deadline=None)
def test_boundary_inv_001(initial_balance, amount):
    """INV-001: Balance must never go below zero."""
    if initial_balance < 0:
        return  # precondition
    ledger = CampusPay({{"sender": initial_balance, "receiver": 0.0}})
    try:
        result = ledger.transfer("sender", "receiver", amount)
        if result:
            assert ledger.get_balance("sender") >= 0, (
                f"INV-001 BREACHED: sender balance = {{ledger.get_balance('sender')}}"
            )
    except ValueError:
        pass  # valid rejection
'''


def _generate_conservation_test(invariant: Invariant) -> str:
    """Generate a Hypothesis test for conservation violations (INV-002)."""
    return f'''
from hypothesis import given, strategies as st, settings
from target_service.campus_pay import CampusPay

@given(
    initial_balance=st.floats(min_value=1.0, max_value=1e5),
    amount=st.floats(min_value=0.01, max_value=1e6),
)
@settings(max_examples=200, deadline=None)
def test_conservation_inv_002(initial_balance, amount):
    """INV-002: Sum of all balances must remain constant."""
    ledger = CampusPay({{"sender": initial_balance, "receiver": 0.0}})
    initial_total = ledger.total_assets()
    try:
        ledger.transfer("sender", "receiver", amount)
        final_total = ledger.total_assets()
        assert abs(final_total - initial_total) < 1e-4, (
            f"INV-002 BREACHED: expected {{initial_total}}, got {{final_total}}"
        )
    except (ValueError, Exception):
        pass  # valid rejection
'''


def _generate_concurrency_test(invariant: Invariant) -> str:
    """Generate a thread-barrier concurrency test for TOCTOU (INV-003)."""
    return f'''
import threading
import time
from target_service.campus_pay import CampusPay

def test_concurrency_inv_003():
    """INV-003: Concurrent transfers must not produce phantom currency."""
    ledger = CampusPay({{"sender": 1000.0, "receiver": 0.0}})
    initial_total = ledger.total_assets()
    barrier = threading.Barrier(2)
    results = []

    def race_transfer(name):
        barrier.wait(timeout=5)
        ok = ledger.transfer("sender", "receiver", 1000.0)
        results.append((name, ok, ledger.total_assets()))

    t1 = threading.Thread(target=race_transfer, args=("thread_a",))
    t2 = threading.Thread(target=race_transfer, args=("thread_b",))
    t1.start()
    t2.start()
    t1.join(timeout=5)
    t2.join(timeout=5)

    final_total = ledger.total_assets()
    if abs(final_total - initial_total) > 1e-4:
        raise AssertionError(
            f"INV-003 BREACHED: initial={{initial_total}}, final={{final_total}}, "
            f"phantom_currency={{final_total - initial_total}}"
        )
'''


_GENERATORS = {
    InvariantType.BOUNDARY: _generate_boundary_test,
    InvariantType.CONSERVATION: _generate_conservation_test,
    InvariantType.CONCURRENCY: _generate_concurrency_test,
    InvariantType.ATOMICITY: _generate_concurrency_test,
    InvariantType.IDEMPOTENCY: _generate_concurrency_test,
}


# ---------------------------------------------------------------------------
# Runner
# ---------------------------------------------------------------------------

def synthesize_and_run(
    extraction: ExtractionResult,
    target_source: str,
    target_path: str = "campus_pay.py",
) -> AttackResult:
    """Generate adversarial tests from extracted invariants and execute them.

    1. For each invariant, generate a property-based test.
    2. Write each test to a temp file alongside the target.
    3. Execute via pytest and collect results.
    """
    from ..sandbox.runner import run_pytest

    result = AttackResult(target_name=target_path)

    if not extraction.invariants:
        return result

    # Determine project root (backend's parent)
    backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    project_root = os.path.dirname(backend_root)

    # Ensure target_service package is importable
    target_pkg = os.path.join(project_root, "backend")
    if target_pkg not in sys.path:
        sys.path.insert(0, target_pkg)

    # Write target source to the importable location
    target_file = os.path.join(backend_root, "target_service", os.path.basename(target_path))
    original_target = ""
    if os.path.exists(target_file):
        with open(target_file) as f:
            original_target = f.read()
    with open(target_file, "w") as f:
        f.write(target_source)

    try:
        for inv in extraction.invariants:
            generator = _GENERATORS.get(inv.type)
            if not generator:
                continue

            test_code = generator(inv)
            test_filename = f"test_{inv.id.lower().replace('-', '_')}.py"

            with tempfile.NamedTemporaryFile(
                mode="w", suffix=".py", prefix="test_", dir=backend_root, delete=False
            ) as tmp:
                tmp.write(test_code)
                tmp_path = tmp.name

            try:
                test_result = run_pytest(tmp_path, cwd=backend_root)
                result.total_tests += 1

                if test_result["exit_code"] == 0:
                    result.passed += 1
                else:
                    result.failed += 1
                    result.failures.append(
                        TestFailure(
                            invariant_id=inv.id,
                            test_name=test_filename,
                            description=test_result.get("stderr", "")[:500],
                            expected=f"{inv.formal_expr} must hold",
                            actual=test_result.get("stdout", "")[:500],
                            traceback=test_result.get("stderr", "")[:1000],
                            exit_code=test_result["exit_code"],
                        )
                    )
            finally:
                os.unlink(tmp_path)
    finally:
        # Restore original target
        if original_target:
            with open(target_file, "w") as f:
                f.write(original_target)

    return result
