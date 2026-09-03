"""
SHIPGUARD Invariant Contracts
Formal schemas for extracted invariants from natural-language specifications.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class InvariantType(str, Enum):
    BOUNDARY = "BOUNDARY"
    CONSERVATION = "CONSERVATION"
    CONCURRENCY = "CONCURRENCY"
    ATOMICITY = "ATOMICITY"


class InvariantStatus(str, Enum):
    STANDBY = "STANDBY"
    EVALUATING = "EVALUATING"
    FALSIFIED = "FALSIFIED"
    VERIFIED = "VERIFIED"


@dataclass
class Invariant:
    id: str
    name: str
    type: InvariantType
    description: str
    formal_expression: str
    status: InvariantStatus = InvariantStatus.STANDBY
    failure_message: Optional[str] = None

    def evaluate(self, passed: bool, message: str = "") -> None:
        if passed:
            self.status = InvariantStatus.VERIFIED
        else:
            self.status = InvariantStatus.FALSIFIED
            self.failure_message = message


@dataclass
class InvariantSuite:
    name: str
    target: str
    invariants: list[Invariant] = field(default_factory=list)

    def add(self, inv: Invariant) -> None:
        self.invariants.append(inv)

    @property
    def all_verified(self) -> bool:
        return all(i.status == InvariantStatus.VERIFIED for i in self.invariants)

    @property
    def any_falsified(self) -> bool:
        return any(i.status == InvariantStatus.FALSIFIED for i in self.invariants)


# Default demo suite for CampusPay
CAMPUSPAY_SUITE = InvariantSuite(
    name="CampusPay Ledger Verification",
    target="CampusPay Ledger Service (Python 3.11)",
    invariants=[
        Invariant(
            id="INV-001",
            name="Non-Negative Balance",
            type=InvariantType.BOUNDARY,
            description="Balance of any account must never drop below zero.",
            formal_expression="∀ account a: balance(a) ≥ 0",
        ),
        Invariant(
            id="INV-002",
            name="Asset Conservation",
            type=InvariantType.CONSERVATION,
            description="Total system assets before and after any operation must be equal.",
            formal_expression="Σ(balances_post) == Σ(balances_pre)",
        ),
        Invariant(
            id="INV-003",
            name="Concurrency Non-Interference",
            type=InvariantType.CONCURRENCY,
            description="System must produce identical outcomes under sequential or concurrent execution.",
            formal_expression="∀ threads t₁, t₂: result(t₁ ∥ t₂) == result(t₁; t₂)",
        ),
    ],
)
