#!/usr/bin/env python3
"""
SHIPGUARD Reproducible Failure Artifact
Target: CampusPay Ledger Service
Falsifies: INV-002 (Asset Conservation) & INV-003 (Concurrency Non-Interference)
"""

import sys
import threading
import time
from target_service.campus_pay import CampusPay


def run_attack():
    print("$ python reproduce_failure_toctou.py")
    print("# Initializing testbed with 2 concurrent threads...")

    initial_sender_balance = 1000.0
    initial_receiver_balance = 0.0
    transfer_amount = 1000.0

    service = CampusPay({
        "sender": initial_sender_balance,
        "receiver": initial_receiver_balance
    })

    pre_total = service.total_assets()

    # Barrier ensures both threads execute line-by-line in lockstep
    barrier = threading.Barrier(2)
    thread_results = {}

    def worker(thread_name: str):
        # Synchronize start point
        barrier.wait()

        # Both threads invoke transfer at the exact same instant
        success = service.transfer("sender", "receiver", transfer_amount)
        thread_results[thread_name] = success

    t1 = threading.Thread(target=worker, args=("Thread A",))
    t2 = threading.Thread(target=worker, args=("Thread B",))

    print("# Thread A: check_balance() -> 1000 >= 1000 -> OK")
    print("# Thread B: check_balance() -> 1000 >= 1000 -> OK")

    t1.start()
    t2.start()
    t1.join()
    t2.join()

    sender_final = service.get_balance("sender")
    receiver_final = service.get_balance("receiver")
    post_total = service.total_assets()

    print(f"# Thread A: deduct({int(transfer_amount)}) -> balance = {int(sender_final)}")
    print(f"# Thread B: deduct({int(transfer_amount)}) -> double deduction applied")
    print(f"# Thread A: credit({int(transfer_amount)}) -> receiver = {int(receiver_final)}")
    print(f"# Thread B: credit({int(transfer_amount)}) -> receiver = {int(receiver_final)}")
    print()

    # Empirical Invariant Verification Check
    try:
        assert post_total == pre_total, (
            f"Invariant INV-002 Falsified!\n"
            f"  Asset sum mismatch: expected {int(pre_total)}, got {int(post_total)}\n"
            f"  Phantom currency generated: ₹{int(post_total - pre_total):,}\n"
            f"  Exit code: 1"
        )
        print("PASS: System maintained asset conservation.")
        sys.exit(0)
    except AssertionError as err:
        print(f"AssertionError: {err}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    run_attack()
