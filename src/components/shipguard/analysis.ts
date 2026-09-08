import type { Invariant } from "./types";
import { DEFAULT_TARGET_NAME } from "./types";

/**
 * Client-side static analysis of Python source using regex heuristics.
 * No server, no subprocess, no LLM — pure deterministic pattern matching
 * so the gate can never crash a cloud deployment.
 */

export interface SourceAnalysis {
  functions: string[];
  branches: number;
  mutations: number;
  raceSuspect: boolean;
  usesLock: boolean;
  guards: string[];
  stateTargets: string[];
  targetName: string;
}

/**
 * Result of analyzing a source snippet. `report` is null when the pasted
 * text does not look like a usable Python module (no top-level def/class),
 * so the UI can disable extraction until real code is provided.
 */
export interface AnalysisResult {
  report: SourceAnalysis | null;
}

// Re-exported so column components can render the preset target name
// without importing from types directly.
export { DEFAULT_TARGET_NAME };

const FUNCTION_RE = /^\s*def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/gm;
const GUARD_RE =
  /\bif\s+(.+?):|\belif\s+(.+?):|\bwhile\s+(.+?):|\bassert\s+(.+?)$/gm;

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

export function analyzeSource(source: string): AnalysisResult {
  // Extract live analysis only for text that plausibly contains Python code.
  // An empty/blank paste yields no report and the extract button stays disabled.
  const hasFunctions = /^\s*(?:def\s+\w+|class\s+\w+|async\s+def\s+\w+)/m.test(source);

  if (!hasFunctions) {
    return { report: null };
  }

  const functions = unique(
    Array.from(source.matchAll(FUNCTION_RE), (m) => m[1] ?? "")
  ).filter(Boolean);

  const branches = Array.from(source.matchAll(GUARD_RE)).length;

  // Attribute assignments / augmented assignments that mutate state.
  const mutationMatches = Array.from(
    source.matchAll(/^\s*(?:self\.)?([A-Za-z_][A-Za-z0-9_.]*)\s*(?:[-+*/]?=)=\s*(?!\s*=).+$/gm)
  );
  const mutations = mutationMatches.length;

  const stateTargets = unique(
    mutationMatches
      .map((m) => (m[1] ?? "").split(".")[0] ?? "")
      .filter((t) => t && t !== "result" && t !== "response" && t !== "local")
  );

  const raceSuspect =
    /(def\s+\w+\([^)]*self[^)]*\)[\s\S]*?)(?=def\s|\Z)/.test(source) &&
    mutations > 0 &&
    !/\block\b|\bLock\s*\(|\bRLock\s*\(|\basyncio\.Lock\b|\bthreading\.Lock\b|\bwith\s+self\._lock\b/.test(
      source
    );

  const usesLock =
    /\bLock\s*\(|\bRLock\s*\(|\bthreading\.Lock\b|\bwith\s+self\._lock\b|\basync with\b/.test(
      source
    );

  const guards = unique(
    Array.from(source.matchAll(GUARD_RE), (m) =>
      (m[1] ?? m[2] ?? m[3] ?? m[4] ?? "").trim()
    )
  ).filter(Boolean);

  return {
    report: {
      functions,
      branches,
      mutations,
      raceSuspect,
      usesLock,
      guards,
      stateTargets,
      targetName: "pasted_target.py",
    },
  };
}

/**
 * Derive three plausible invariant contracts from the analysis, matching the
 * three canonical classes SHIPGUARD hunts: BOUNDARY, CONSERVATION, CONCURRENCY.
 */
export function deriveInvariants(analysis: SourceAnalysis): Invariant[] {
  // Prefer a real entrypoint over dunder helpers like __init__.
  const primary =
    analysis.functions.find((f) => !f.startsWith("__")) ??
    analysis.functions[0] ??
    "transfer";
  const state = analysis.stateTargets[0] ?? "balance";
  const guard = analysis.guards[0] ?? `${state} >= 0`;

  return [
    {
      id: "INV-001",
      type: "BOUNDARY",
      label: `${state} never < 0`,
      description: `∀ call to ${primary}(): assert ${guard}`,
      status: "standby",
    },
    {
      id: "INV-002",
      type: "CONSERVATION",
      label: "State conservation under mutation",
      description: `Σ(${state}_pre) == Σ(${state}_post) across every mutation path in ${primary}()`,
      status: "standby",
    },
    {
      id: "INV-003",
      type: "CONCURRENCY",
      label: analysis.usesLock
        ? "Idempotent under synchronized execution"
        : "Idempotent under simultaneous execution",
      description: analysis.usesLock
        ? "Concurrent execution must remain equivalent to sequential (lock discipline detected)"
        : "Concurrent execution must be equivalent to sequential — no interleaving may double-apply a mutation",
      status: "standby",
    },
  ];
}

/**
 * Build the structured counterexample prompt a human pastes back into
 * IBM Bob (or any coding agent) so the agent can repair its own bug.
 */
export function buildCounterexamplePrompt(args: {
  targetName: string;
  invariantId: string;
  invariantType: string;
  invariantLabel: string;
  sourceFunction: string;
  preTotal: number;
  postTotal: number;
}): string {
  const {
    targetName,
    invariantId,
    invariantType,
    invariantLabel,
    sourceFunction,
    preTotal,
    postTotal,
  } = args;
  const phantom = postTotal - preTotal;

  return [
    "[IBM BOB AGENT CONTEXT]",
    `Target: ${targetName}`,
    `Invariant Breached: ${invariantId} (${invariantType}) — ${invariantLabel}`,
    `Violation Trace: Post-state sum ${postTotal} != Pre-state sum ${preTotal} (+${phantom} phantom currency)`,
    `Failing Function: ${sourceFunction}() — check-then-act gap between guard and mutation`,
    "Action: Refactor using threading.RLock() or atomic operations around the read-modify-write window.",
  ].join("\n");
}
