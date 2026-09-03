"""
CampusPay Ledger Service (Patched — Thread-Safe Version)

All invariants now hold:
- R1 (Non-Negative Balance): ∀ account a: balance(a) >= 0
- R2 (Asset Conservation): Σ(balances_post) == Σ(balances_pre)
- R3 (Atomicity): Concurrent transfers execute under a mutex lock.
"""

import threading
from typing import Dict


class CampusPayPatched:
    def __init__(self, initial_balances: Dict[str, float] = None):
        self.balances: Dict[str, float] = initial_balances.copy() if initial_balances else {}
        self._lock = threading.Lock()

    def get_balance(self, account: str) -> float:
        with self._lock:
            return self.balances.get(account, 0.0)

    def total_assets(self) -> float:
        with self._lock:
            return sum(self.balances.values())

    def transfer(self, from_acc: str, to_acc: str, amount: float) -> bool:
        """
        Patched transfer method.
        FIX: Check-and-mutate is now atomic under a mutex lock,
        eliminating the TOCTOU concurrency window.
        """
        with self._lock:
            if amount <= 0:
                return False

            current_balance = self.balances.get(from_acc, 0.0)

            if current_balance >= amount:
                self.balances[from_acc] = self.balances.get(from_acc, 0.0) - amount
                self.balances[to_acc] = self.balances.get(to_acc, 0.0) + amount
                return True

            return False
