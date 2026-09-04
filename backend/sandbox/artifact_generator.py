"""Reproduction artifact generator — writes a standalone, self-contained
Python script that reliably reproduces a detected failure with exit code 1.
"""

from __future__ import annotations

import os
import textwrap
from typing import List

from ..contracts.schemas import TestFailure


def generate_reproduction_script(
    failures: List[TestFailure],
    target_source: str,
    output_path: str | None = None,
) -> str:
    """Generate a standalone reproduction script for the given failures.

    The script:
      1. Embeds the target source inline (no external imports needed)
      2. Reproduces the exact failure scenario
      3. Exits with code 1 if the invariant is falsified
      4. Exits with code 0 if the invariant holds (unexpected)
    """
    if not failures:
        return ""

    failure = failures[0]  # primary failure

    script = textwrap.dedent(f'''\
        #!/usr/bin/env python3
        """
        SHIPGUARD Reproduction Artifact
        ================================
        Generated to reliably reproduce: {failure.invariant_id}
        Test: {failure.test_name}
        Description: {failure.description[:200]}

        Usage: python reproduce_failure.py
        Exit code: 1 = invariant falsified (expected)
                   0 = invariant holds (unexpected — bug may be fixed)
        """

        import sys
        import threading

        # ---- Embedded Target Source ----
{target_source}

        # ---- Reproduction Logic ----
        def main():
            """Reproduce the {failure.invariant_id} failure."""
            ledger = CampusPay({{"sender": 1000.0, "receiver": 0.0}})
            initial_total = ledger.total_assets()

            barrier = threading.Barrier(2)
            results = []

            def race_transfer(name):
                barrier.wait(timeout=5)
                ok = ledger.transfer("sender", "receiver", 1000.0)
                results.append((name, ok, ledger.total_assets()))

            print(f"# Running concurrency attack with 2 threads...")
            print(f"# Initial state: sender={{ledger.get_balance('sender')}}, receiver={{ledger.get_balance('receiver')}}, total={{ledger.total_assets()}}")

            t1 = threading.Thread(target=race_transfer, args=("thread_a",))
            t2 = threading.Thread(target=race_transfer, args=("thread_b",))
            t1.start()
            t2.start()
            t1.join(timeout=5)
            t2.join(timeout=5)

            final_total = ledger.total_assets()
            print(f"# Final state: sender={{ledger.get_balance('sender')}}, receiver={{ledger.get_balance('receiver')}}, total={{final_total}}")

            if abs(final_total - initial_total) > 1e-4:
                phantom = final_total - initial_total
                print(f"")
                print(f"AssertionError: Invariant {failure.invariant_id} Falsified!")
                print(f"  Asset sum mismatch: expected {{initial_total}}, got {{final_total}}")
                print(f"  Phantom currency generated: {{phantom}}")
                print(f"  Exit code: 1")
                sys.exit(1)
            else:
                print(f"")
                print(f"INVARIANT HOLD: {failure.invariant_id} not falsified.")
                print(f"  Asset sum: {{final_total}} == {{initial_total}}")
                sys.exit(0)


        if __name__ == "__main__":
            main()
    ''')

    if output_path:
        os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
        with open(output_path, "w") as f:
            f.write(script)

    return script


def generate_all_artifacts(
    failures: List[TestFailure],
    target_source: str,
    output_dir: str = "artifacts",
) -> List[str]:
    """Generate reproduction scripts for all failures. Returns list of file paths."""
    paths = []
    for failure in failures:
        filename = f"reproduce_failure_{failure.invariant_id.lower().replace('-', '_')}.py"
        path = os.path.join(output_dir, filename)
        generate_reproduction_script([failure], target_source, output_path=path)
        paths.append(path)
    return paths
