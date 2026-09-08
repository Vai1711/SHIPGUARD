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
  /**
   * Machine-checkable predicate over the attack execution context, e.g.
   * "post_total == pre_total". Editable by the user; compiled by the
   * attack synthesizer (Python) and the client demo evaluator (TS).
   */
  expression?: string;
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
    label: "Balance never < 0",
    description: "Balance must stay non-negative",
    status: "standby",
  },
  {
    id: "INV-002",
    type: "CONSERVATION",
    label: "Sum of balances must stay constant",
    description: "Asset conservation under transfer",
    status: "standby",
  },
  {
    id: "INV-003",
    type: "CONCURRENCY",
    label: "Idempotent under simultaneous execution",
    description: "Concurrent execution must be equivalent to sequential",
    status: "standby",
  },
];

export const SPEC_TEXT = `R1: Non-Negative Balance — No account balance may go below zero.
R2: Asset Conservation — The sum of all account balances before a transfer must equal the sum after.
R3: Atomicity & Idempotency — Concurrent transfers must execute atomically; simultaneous execution must not produce double-spends or phantom currency.`;
