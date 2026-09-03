export type DemoPhase =
  | "idle"
  | "extracting"
  | "contracts"
  | "attacking"
  | "breached"
  | "patching"
  | "verified";

export type InvariantStatus = "standby" | "evaluating" | "falsified" | "verified";

export type AttackVector = "boundary" | "replay" | "toctou";

export interface Invariant {
  id: string;
  type: string;
  label: string;
  description: string;
  status: InvariantStatus;
}

export interface LedgerState {
  sender: number;
  receiver: number;
  total: number;
}

export interface TargetFile {
  name: string;
  content: string;
}

export const DEFAULT_TARGET_NAME = "campus_pay.py";

export const INVARIANTS: Invariant[] = [
  {
    id: "INV-001",
    type: "BOUNDARY",
    label: "Balance never < ₹0",
    description: "∀ account a: balance(a) ≥ 0",
    status: "standby",
  },
  {
    id: "INV-002",
    type: "CONSERVATION",
    label: "∑(Balances_post) == ∑(Balances_pre)",
    description: "Asset conservation under transfer: Σ(b_post) = Σ(b_pre)",
    status: "standby",
  },
  {
    id: "INV-003",
    type: "CONCURRENCY",
    label: "Idempotent under simultaneous execution",
    description: "∀ t1, t2: execute(t1 ∥ t2) ≡ sequential(t1, t2)",
    status: "standby",
  },
];

export const SPEC_TEXT = `R1: Non-Negative Balance — No account balance may go below zero.
R2: Asset Conservation — The sum of all account balances before a transfer must equal the sum after.
R3: Atomicity & Idempotency — Concurrent transfers must execute atomically; simultaneous execution must not produce double-spends or phantom currency.`;
