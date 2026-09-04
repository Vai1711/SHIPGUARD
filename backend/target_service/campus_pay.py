"""CampusPay Ledger Service — intentionally concurrency-buggy reference target.

This module contains a TOCTOU (Time-of-Check-Time-of-Use) race condition
in the transfer method. Two concurrent threads can both pass the balance
check and then both deduct, generating phantom currency.

This is the "before" version that SHIPGUARD is designed to detect and fix.
"""

from __future__ import annotations

import threading
from typing import Dict


class CampusPay:
    """Simulates a campus payment ledger with a concurrency bug.

    The race condition exists because check_balance() and deduct() are
    separate, non-atomic operations. Between the check and the deduction,
    another thread can interleave and pass the same check.
    """

    def __init__(self, initial_balances: Dict[str, float] | None = None):
        self.balances: Dict[str, float] = dict(initial_balances or {})
        self._lock = threading.RLock()  # exists but NOT used in transfer()
        self._transaction_log: list[str] = []

    def get_balance(self, account: str) -> float:
        """Read the current balance for an account."""
        return self.balances.get(account, 0.0)

    def total_assets(self) -> float:
        """Return the sum of all account balances (conservation check)."""
        return sum(self.balances.values())

    def check_balance(self, account: str, amount: float) -> bool:
        """Check whether account has sufficient balance.

        BUG: This is a separate call from deduct(), creating a TOCTOU window.
        A concurrent thread can call check_balance() after this one but before
        deduct() completes, and both will pass.
        """
        return self.balances.get(account, 0.0) >= amount

    def transfer(self, from_acc: str, to_acc: str, amount: float) -> bool:
        """Transfer funds between two accounts.

        BUG: The check and mutation are NOT atomic. This is the seed flaw
        that Hypothesis + thread interleaving will exploit.

        Invariant violated:
            INV-002: Σ(balances_post) == Σ(balances_pre)
        """
        if amount <= 0:
            raise ValueError(f"Transfer amount must be positive, got {amount}")

        if not self.check_balance(from_acc, amount):
            return False

        # --- TOCTOU WINDOW START ---
        # Another thread can interleave here. Both threads pass the check
        # above, then both deduct below, creating phantom currency.
        # --- TOCTOU WINDOW END ---

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
