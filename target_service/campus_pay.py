"""
CampusPay Ledger Service (AI-Generated Seed Implementation)

Known Requirements:
- R1 (Non-Negative Balance): ∀ account a: balance(a) >= 0
- R2 (Asset Conservation): Σ(balances_post) == Σ(balances_pre)
- R3 (Atomicity): Concurrent transfers must execute sequentially/atomically.
"""

import time
from typing import Dict


class CampusPay:
    def __init__(self, initial_balances: Dict[str, float] = None):
        self.balances: Dict[str, float] = initial_balances.copy() if initial_balances else {}

    def get_balance(self, account: str) -> float:
        return self.balances.get(account, 0.0)

    def total_assets(self) -> float:
        return sum(self.balances.values())

    def transfer(self, from_acc: str, to_acc: str, amount: float) -> bool:
        """
        AI-generated transfer method.
        FLAW: Check and mutation are desynchronized without locking/atomic barriers,
        creating an exploitable TOCTOU concurrency window.
        """
        if amount <= 0:
            return False

        current_balance = self.balances.get(from_acc, 0.0)

        # 1. TIME OF CHECK
        if current_balance >= amount:
            # Simulated I/O latency, network call, or thread preemption window
            time.sleep(0.01)

            # 2. TIME OF USE (Unsynchronized state mutation)
            self.balances[from_acc] = self.balances.get(from_acc, 0.0) - amount
            self.balances[to_acc] = self.balances.get(to_acc, 0.0) + amount
            return True

        return False
