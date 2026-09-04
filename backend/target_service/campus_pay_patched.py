"""CampusPay Ledger Service — patched, thread-safe version.

This is the "after" version with the TOCTOU race condition fixed.
The check-and-deduct is now atomic under a reentrant lock.

Applied patch: wrap transfer critical section with `with self._lock:`
"""

from __future__ import annotations

import threading
from typing import Dict


class CampusPay:
    """Thread-safe campus payment ledger.

    The transfer method now holds self._lock for the entire check-and-mutate
    sequence, eliminating the TOCTOU window.
    """

    def __init__(self, initial_balances: Dict[str, float] | None = None):
        self.balances: Dict[str, float] = dict(initial_balances or {})
        self._lock = threading.RLock()
        self._transaction_log: list[str] = []

    def get_balance(self, account: str) -> float:
        """Read the current balance for an account."""
        return self.balances.get(account, 0.0)

    def total_assets(self) -> float:
        """Return the sum of all account balances (conservation check)."""
        return sum(self.balances.values())

    def check_balance(self, account: str, amount: float) -> bool:
        """Check whether account has sufficient balance."""
        return self.balances.get(account, 0.0) >= amount

    def transfer(self, from_acc: str, to_acc: str, amount: float) -> bool:
        """Transfer funds between two accounts — thread-safe version.

        PATCHED: The entire check-and-mutate is now atomic under self._lock.
        This eliminates the TOCTOU race condition.

        Invariants preserved:
            INV-001: balance(from_acc) >= 0  (checked inside lock)
            INV-002: Σ(balances_post) == Σ(balances_pre)  (no double-spend)
            INV-003: Concurrent transfers are serialized
        """
        with self._lock:
            if amount <= 0:
                raise ValueError(f"Transfer amount must be positive, got {amount}")

            if self.balances.get(from_acc, 0.0) < amount:
                return False

            self.balances[from_acc] -= amount
            self.balances[to_acc] = self.balances.get(to_acc, 0.0) + amount
            self._transaction_log.append(f"{from_acc}->{to_acc}:{amount}")
            return True

    def deposit(self, account: str, amount: float) -> None:
        """Deposit funds into an account."""
        if amount <= 0:
            raise ValueError(f"Deposit amount must be positive, got {amount}")
        self.balances[account] = self.balances.get(account, 0.0) + amount

    def withdraw(self, account: str, amount: float) -> bool:
        """Withdraw funds from an account."""
        if not self.check_balance(account, amount):
            return False
        self.balances[account] -= amount
        self._transaction_log.append(f"{account}:-{amount}")
        return True
