"""SHIPGUARD Backend Engine — CLI entry point and programmatic API.

Runs the full pipeline: Extract → Attack → Repair → Verify.

Usage:
    python -m backend.main --target campus_pay.py
    python -m backend.main --source /path/to/file.py
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time

# Ensure backend package is importable
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, os.path.dirname(backend_dir))

from backend.contracts.extractor import extract_invariants
from backend.contracts.schemas import (
    AttackResult,
    ExtractionResult,
    PatchResult,
    VerificationReceipt,
)
from backend.sandbox.artifact_generator import generate_all_artifacts
from backend.synthesizer.attack_synthesizer import synthesize_and_run


def load_target_source(source: str | None = None, target: str = "campus_pay.py") -> str:
    """Load target source from a file path or string."""
    if source:
        if os.path.isfile(source):
            with open(source) as f:
                return f.read()
        return source  # treat as raw source

    # Load from target_service directory
    target_path = os.path.join(backend_dir, "target_service", target)
    if os.path.exists(target_path):
        with open(target_path) as f:
            return f.read()

    raise FileNotFoundError(f"Target source not found: {target}")


def run_pipeline(
    target_source: str,
    target_name: str = "campus_pay.py",
    skip_repair: bool = False,
) -> dict:
    """Run the full SHIPGUARD pipeline and return structured results.

    Steps:
        1. Extract invariants from source via AST parsing
        2. Synthesize and run adversarial tests via Hypothesis
        3. If breached: repair via LibCST AST rewriting
        4. Re-verify patched code
        5. Generate cryptographic receipt

    Returns a dict with all results serialized for JSON transport.
    """
    results = {}
    total_start = time.monotonic()

    # Step 1: Extract
    print("[1/4] Extracting invariants via AST parsing...")
    extraction = extract_invariants(target_source)
    results["extraction"] = extraction.to_dict()
    results["extraction"]["invariant_count"] = len(extraction.invariants)
    print(f"  Found {len(extraction.invariants)} invariants, "
          f"{len(extraction.mutations)} mutations, "
          f"{len(extraction.guards)} guards across "
          f"{extraction.functions_analyzed} functions")

    # Step 2: Attack
    print("[2/4] Running adversarial attack suite via Hypothesis...")
    attack_start = time.monotonic()
    attack_result = synthesize_and_run(extraction, target_source, target_name)
    attack_result.execution_time_ms = (time.monotonic() - attack_start) * 1000
    results["attack"] = attack_result.to_dict()
    print(f"  {attack_result.total_tests} tests: "
          f"{attack_result.passed} passed, {attack_result.failed} failed "
          f"({attack_result.execution_time_ms:.0f}ms)")

    # Generate reproduction artifacts
    if attack_result.failures:
        artifact_dir = os.path.join(backend_dir, "artifacts")
        artifacts = generate_all_artifacts(attack_result.failures, target_source, artifact_dir)
        results["artifacts"] = artifacts
        print(f"  Generated {len(artifacts)} reproduction artifacts")

    # Step 3: Repair (if breached)
    receipt = None
    if attack_result.breached and not skip_repair:
        print("[3/4] Applying autonomous repair via LibCST AST rewriting...")
        from backend.repair.repair_engine import repair_source, verify_patch

        patch_result = repair_source(target_source, extraction, attack_result)
        results["repair"] = patch_result.to_dict()
        print(f"  Applied {patch_result.patches_applied} patches using: {patch_result.strategy}")

        # Step 4: Re-verify
        print("[4/4] Re-verifying patched code...")
        receipt, re_result = verify_patch(
            patch_result.patched_source, extraction, attack_result, target_name
        )
        results["re_verification"] = re_result.to_dict()
        results["receipt"] = receipt.to_dict()
        print(f"  Re-verification: {re_result.passed}/{re_result.total_tests} passed")
        print(f"  Gate decision: {receipt.gate_decision}")
    else:
        print("[3/4] No breaches detected — skipping repair")
        print("[4/4] N/A — no repair needed")
        receipt = VerificationReceipt(
            status="VERIFIED" if not attack_result.breached else "BREACHED",
            invariants_verified=attack_result.passed,
            invariants_total=attack_result.total_tests,
            target_name=target_name,
        )
        receipt.commit_hash = receipt.generate_hash()
        results["receipt"] = receipt.to_dict()

    total_ms = (time.monotonic() - total_start) * 1000
    results["total_time_ms"] = round(total_ms, 2)

    return results


def main():
    parser = argparse.ArgumentParser(description="SHIPGUARD Adversarial Invariant Gate")
    parser.add_argument("--target", default="campus_pay.py", help="Target file in target_service/")
    parser.add_argument("--source", help="Path to source file (overrides --target)")
    parser.add_argument("--json", action="store_true", help="Output results as JSON")
    parser.add_argument("--skip-repair", action="store_true", help="Skip repair step")
    args = parser.parse_args()

    target_source = load_target_source(args.source, args.target)
    target_name = os.path.basename(args.source or args.target)

    results = run_pipeline(target_source, target_name, skip_repair=args.skip_repair)

    if args.json:
        print(json.dumps(results, indent=2, default=str))
    else:
        print(f"\n{'='*60}")
        print(f"  SHIPGUARD Pipeline Complete")
        print(f"  Total time: {results['total_time_ms']}ms")
        print(f"{'='*60}")


if __name__ == "__main__":
    main()
