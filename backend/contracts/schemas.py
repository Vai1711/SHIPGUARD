"""Invariant schemas and data models for the SHIPGUARD verification engine."""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass, field, asdict
from enum import Enum
from typing import List, Optional
from datetime import datetime, timezone


class InvariantType(str, Enum):
    BOUNDARY = "BOUNDARY"
    CONSERVATION = "CONSERVATION"
    CONCURRENCY = "CONCURRENCY"
    ATOMICITY = "ATOMICITY"
    IDEMPOTENCY = "IDEMPOTENCY"
    STATE_ORDERING = "STATE_ORDERING"


class InvariantStatus(str, Enum):
    STANDBY = "standby"
    EVALUATING = "evaluating"
    FALSIFIED = "falsified"
    VERIFIED = "verified"


class AttackVector(str, Enum):
    BOUNDARY = "boundary"
    REPLAY = "replay"
    TOCTOU = "toctou"
    OVERFLOW = "overflow"
    NEGATIVE = "negative"


@dataclass
class Invariant:
    """A formal invariant contract extracted from source code or specification."""
    id: str
    type: InvariantType
    label: str
    description: str
    formal_expr: str
    status: InvariantStatus = InvariantStatus.STANDBY
    source_line: Optional[int] = None
    source_function: Optional[str] = None

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "type": self.type.value,
            "label": self.label,
            "description": self.description,
            "formal_expr": self.formal_expr,
            "status": self.status.value,
            "source_line": self.source_line,
            "source_function": self.source_function,
        }


@dataclass
class StateMutation:
    """A detected state mutation in the target code."""
    target: str
    operator: str
    value_expr: str
    line: int
    function: str


@dataclass
class GuardCondition:
    """A detected guard/check condition in the target code."""
    expression: str
    line: int
    function: str
    negated: bool = False


@dataclass
class ExtractionResult:
    """Result of invariant extraction from source code."""
    invariants: List[Invariant] = field(default_factory=list)
    mutations: List[StateMutation] = field(default_factory=list)
    guards: List[GuardCondition] = field(default_factory=list)
    functions_analyzed: int = 0
    source_hash: str = ""

    def to_dict(self) -> dict:
        return {
            "invariants": [i.to_dict() for i in self.invariants],
            "mutations": [asdict(m) for m in self.mutations],
            "guards": [asdict(g) for g in self.guards],
            "functions_analyzed": self.functions_analyzed,
            "source_hash": self.source_hash,
        }


@dataclass
class TestFailure:
    """A single test failure from adversarial execution."""
    invariant_id: str
    test_name: str
    description: str
    expected: str
    actual: str
    traceback: str
    reproduction_script: str = ""
    exit_code: int = 1


@dataclass
class AttackResult:
    """Result of running the adversarial attack suite."""
    failures: List[TestFailure] = field(default_factory=list)
    total_tests: int = 0
    passed: int = 0
    failed: int = 0
    execution_time_ms: float = 0.0
    target_name: str = ""

    @property
    def breached(self) -> bool:
        return self.failed > 0

    def to_dict(self) -> dict:
        return {
            "failures": [asdict(f) for f in self.failures],
            "total_tests": self.total_tests,
            "passed": self.passed,
            "failed": self.failed,
            "execution_time_ms": self.execution_time_ms,
            "breached": self.breached,
            "target_name": self.target_name,
        }


@dataclass
class PatchResult:
    """Result of autonomous repair."""
    original_source: str = ""
    patched_source: str = ""
    diff: str = ""
    patches_applied: int = 0
    strategy: str = ""
    verification_passed: bool = False
    verification_details: str = ""

    def to_dict(self) -> dict:
        return {
            "original_source": self.original_source,
            "patched_source": self.patched_source,
            "diff": self.diff,
            "patches_applied": self.patches_applied,
            "strategy": self.strategy,
            "verification_passed": self.verification_passed,
            "verification_details": self.verification_details,
        }


@dataclass
class VerificationReceipt:
    """Cryptographic verification receipt after successful patch + re-verify."""
    status: str = "VERIFIED"
    commit_hash: str = ""
    gate_decision: str = "MERGE APPROVED (CI/CD UNLOCKED)"
    invariants_verified: int = 0
    invariants_total: int = 0
    timestamp: str = ""
    target_name: str = ""

    def generate_hash(self) -> str:
        payload = json.dumps({
            "status": self.status,
            "gate_decision": self.gate_decision,
            "invariants_verified": self.invariants_verified,
            "invariants_total": self.invariants_total,
            "timestamp": self.timestamp,
        }, sort_keys=True)
        return "sha256:" + hashlib.sha256(payload.encode()).hexdigest()

    def to_dict(self) -> dict:
        return {
            "status": self.status,
            "commit_hash": self.commit_hash or self.generate_hash(),
            "gate_decision": self.gate_decision,
            "invariants_verified": self.invariants_verified,
            "invariants_total": self.invariants_total,
            "timestamp": self.timestamp or datetime.now(timezone.utc).isoformat(),
            "target_name": self.target_name,
        }
