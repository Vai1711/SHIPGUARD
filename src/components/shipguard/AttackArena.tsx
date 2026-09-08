import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { DemoPhase, AttackVector, Invariant } from "./types";
import { DEFAULT_TARGET_NAME } from "./types";
import type { AttackContext, PredicateResult } from "./predicates";
import { normalizeExpression } from "./predicates";
import { TerminalView } from "./TerminalView";
import { Button } from "@/components/ui/button";
import {
  Flame,
  AlertTriangle,
  Swords,
  GitBranch,
  FileCode,
  Terminal,
  ArrowRight,
} from "lucide-react";

const attackVectors: { id: AttackVector; label: string; icon: typeof Flame; desc: string }[] = [
  { id: "boundary", label: "Boundary", icon: Flame, desc: "₹0 edge case" },
  { id: "replay", label: "Replay", icon: GitBranch, desc: "State mutation replay" },
  { id: "toctou", label: "TOCTOU", icon: Swords, desc: "Race condition" },
];

const timelineStepsA = [
  "Check Balance (₹1,000 >= ₹1,000) [OK]",
  "TOCTOU Delay 10ms",
  "Deduct ₹1,000",
  "Credit ₹1,000",
];

const timelineStepsB = [
  "Check Balance (₹1,000 >= ₹1,000) [OK]",
  "TOCTOU Delay 10ms",
  "Deduct ₹1,000",
  "Credit ₹1,000",
];

interface BreachVerdict {
  invariant: Invariant;
  result: PredicateResult;
}

/**
 * Terminal feed for the reproduce artifact. The failing predicate shown is
 * the user's actual edited expression (normalized to canonical Python-ish
 * form), evaluated for real by the shared predicate engine.
 */
function buildTerminalOutput(
  targetName: string,
  context: AttackContext,
  breach?: BreachVerdict | null
) {
  const invId = breach?.invariant.id ?? "INV-002";
  const formula = normalizeExpression(
    breach?.invariant.expression ?? "post_total == pre_total"
  );
  const phantom = context.post_total - context.pre_total;
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return [
    `$ shipguard fuzz --target ${targetName} --concurrency 2 --barrier-sync`,
    `[INFO] Ingesting contract specifications: [INV-001, INV-002, INV-003]`,
    `[INFO] Active property: assert ${formula}`,
    `[RUN] Spawning Worker-Thread-01 and Worker-Thread-02 (TOCTOU Window: 10ms)`,
    `[INTERLEAVE] Thread 1 reads balance=${fmt(context.pre_sender)} (Check OK)`,
    `[INTERLEAVE] Thread 2 reads balance=${fmt(context.pre_sender)} (Check OK)`,
    `[MUTATE] Thread 1 writes balance=0.0, receiver=${fmt(context.amount)}`,
    `[MUTATE] Thread 2 writes balance=${fmt(-context.amount)}, receiver=${fmt(2 * context.amount)}`,
    `-`.repeat(70),
    `FAIL: test_invariant_contract (${targetName})`,
    `AssertionError: Contract [${invId}] Falsified!`,
    `  Failed Predicate: ${formula}`,
    `  State: pre_sum=${fmt(context.pre_total)} | post_sum=${fmt(context.post_total)} (Phantom: +${fmt(phantom)})`,
    `[RESULT] Exit Code 1 — Attack suite produced valid counterexample.`,
  ];
}

function ConcurrencyTimeline({ active }: { active: boolean }) {
  const [stepA, setStepA] = useState(-1);
  const [stepB, setStepB] = useState(-1);
  const [showBreach, setShowBreach] = useState(false);

  useEffect(() => {
    if (!active) {
      setStepA(-1);
      setStepB(-1);
      setShowBreach(false);
      return;
    }
    let aIdx = 0;
    let bIdx = 0;
    const interval = setInterval(() => {
      if (aIdx < timelineStepsA.length) {
        setStepA(aIdx);
        aIdx++;
      }
      if (aIdx >= 2 && bIdx < timelineStepsB.length) {
        setStepB(bIdx);
        bIdx++;
      }
      if (aIdx >= timelineStepsA.length && bIdx >= timelineStepsB.length) {
        clearInterval(interval);
        setTimeout(() => setShowBreach(true), 400);
      }
    }, 600);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className="space-y-3">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
        Concurrency Interleaving Timeline
      </h4>

      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 relative">
        {/* Thread A */}
        <div className="text-[10px] font-bold text-cyan-400 font-mono pt-0.5">Thread A</div>
        <div className="flex flex-col gap-1">
          {timelineStepsA.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: i <= stepA ? 1 : 0.15, x: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-mono transition-all duration-300",
                i <= stepA
                  ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                  : "bg-white/[0.02] text-zinc-600 border border-transparent"
              )}
            >
              <div
                className={cn(
                  "h-1.5 w-1.5 rounded-full flex-shrink-0",
                  i <= stepA ? "bg-cyan-400" : "bg-zinc-700"
                )}
              />
              {step}
            </motion.div>
          ))}
        </div>

        {/* Thread B */}
        <div className="text-[10px] font-bold text-violet-400 font-mono pt-0.5">Thread B</div>
        <div className="flex flex-col gap-1">
          {timelineStepsB.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: i <= stepB ? 1 : 0.15, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-mono transition-all duration-300",
                i <= stepB
                  ? "bg-violet-500/10 text-violet-300 border border-violet-500/20"
                  : "bg-white/[0.02] text-zinc-600 border border-transparent"
              )}
            >
              <div
                className={cn(
                  "h-1.5 w-1.5 rounded-full flex-shrink-0",
                  i <= stepB ? "bg-violet-400" : "bg-zinc-700"
                )}
              />
              {step}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Race condition warning beam */}
      <AnimatePresence>
        {showBreach && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-500/[0.08] via-red-500/[0.03] to-red-500/[0.08] border border-red-500/30 animate-border-flash-red" />
            <div className="relative flex items-center gap-2 rounded-lg bg-red-500/[0.06] border border-red-500/20 px-3 py-2.5">
              <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 animate-pulse" />
              <div>
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                  Critical Race Condition
                </p>
                <p className="text-[10px] text-red-400/70 font-mono">
                  Double-spend window exploited — both threads passed the balance check before either committed
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StateDifferential({
  breached,
  breach,
}: {
  breached: boolean;
  breach?: BreachVerdict | null;
}) {
  return (
    <div className="space-y-2">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
        State Differential Inspector
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {/* Pre-State */}
        <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5">
          <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
            Pre-State
          </p>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-500">Sender</span>
              <span className="font-mono font-semibold text-zinc-300">₹1,000</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-500">Receiver</span>
              <span className="font-mono font-semibold text-zinc-300">₹0</span>
            </div>
            <div className="border-t border-white/[0.06] pt-1 mt-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400 font-semibold">Total</span>
                <span className="font-mono font-bold text-zinc-200">₹1,000</span>
              </div>
            </div>
          </div>
        </div>
        {/* Post-State */}
        <div
          className={cn(
            "rounded-lg border p-2.5 transition-all duration-500",
            breached
              ? "bg-red-500/[0.06] border-red-500/20"
              : "bg-white/[0.03] border-white/[0.06]"
          )}
        >
          <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
            Post-State
          </p>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-500">Sender</span>
              <span className="font-mono font-semibold text-zinc-300">₹0</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-500">Receiver</span>
              <span className="font-mono font-semibold text-zinc-300">₹2,000</span>
            </div>
            <div className="border-t border-white/[0.06] pt-1 mt-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400 font-semibold">Total</span>
                <span
                  className={cn(
                    "font-mono font-bold",
                    breached ? "text-red-400" : "text-zinc-200"
                  )}
                >
                  ₹2,000
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delta badge */}
      <AnimatePresence>
        {breached && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-lg bg-red-500/[0.06] border border-red-500/20 px-3 py-2"
          >
            <span className="text-sm">🚨</span>
            <div>
              <p className="text-[10px] font-bold text-red-400 uppercase">
                +₹1,000 Phantom Currency Generated
              </p>
              <p className="text-[9px] text-red-400/60 font-mono">
                {breach
                  ? `${breach.invariant.id} breach — predicate falsified: ${normalizeExpression(
                      breach.invariant.expression ?? "post_total == pre_total"
                    )}`
                  : "INV-002 breach — asset conservation violated"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AttackArena({
  phase,
  onLaunch,
  targetName = DEFAULT_TARGET_NAME,
  invariants = [],
  breach = null,
  context,
}: {
  phase: DemoPhase;
  onLaunch: () => void;
  targetName?: string;
  invariants?: Invariant[];
  breach?: BreachVerdict | null;
  context?: AttackContext;
}) {
  const [selectedVector, setSelectedVector] = useState<AttackVector>("toctou");
  const isAttacking = phase === "attacking";
  const isBreached = phase === "breached";
  const showTimeline = isAttacking || isBreached;
  const showTerminal = isBreached;
  const canLaunch = phase === "contracts";
  const ctx: AttackContext =
    context ?? {
      pre_sender: 1000,
      pre_receiver: 0,
      pre_total: 1000,
      post_sender: -1000,
      post_receiver: 2000,
      post_total: 2000,
      amount: 1000,
    };
  const terminalOutput = buildTerminalOutput(targetName, ctx, breach);
  const activeProperty = breach
    ? normalizeExpression(breach.invariant.expression ?? "post_total == pre_total")
    : invariants[0]?.expression
      ? normalizeExpression(invariants[0].expression!)
      : null;

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Attack Suite Trigger */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Swords className="h-4 w-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Adversarial Attack Suite
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {attackVectors.map((v) => {
            const Icon = v.icon;
            return (
              <button
                key={v.id}
                onClick={() => setSelectedVector(v.id)}
                disabled={!canLaunch}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border p-2.5 text-center transition-all duration-200",
                  selectedVector === v.id
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-sm shadow-amber-500/10"
                    : "bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:border-white/[0.12] hover:text-zinc-300",
                  !canLaunch && "opacity-40 cursor-not-allowed"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[10px] font-bold">{v.label}</span>
                <span className="text-[9px] text-zinc-600">{v.desc}</span>
              </button>
            );
          })}
        </div>
        {/* Active property chip — the exact user-edited predicate under test */}
        {activeProperty && (
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
              Active property:
            </span>
            <span className="inline-flex items-center rounded-md border border-cyan-500/25 bg-cyan-500/[0.07] px-2 py-0.5 font-mono text-[10px] font-semibold text-cyan-300">
              assert {activeProperty}
            </span>
          </div>
        )}

        <Button
          onClick={onLaunch}
          disabled={!canLaunch}
          size="sm"
          className={cn(
            "w-full gap-1.5 text-[11px] font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 shadow-md shadow-amber-500/20 transition-all disabled:opacity-40 disabled:shadow-none",
            isAttacking && "animate-pulse-glow-amber"
          )}
        >
          <Flame className="h-3.5 w-3.5" />
          Launch Adversarial Suite
        </Button>
      </div>

      {/* Concurrency Timeline */}
      <AnimatePresence>
        {showTimeline && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-4"
          >
            <ConcurrencyTimeline active={isAttacking || isBreached} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* State Differential */}
      <AnimatePresence>
        {(isBreached || showTimeline) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl p-4"
          >
            <StateDifferential breached={isBreached} breach={breach} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reproduce Artifact Drawer */}
      <AnimatePresence>
        {showTerminal && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <FileCode className="h-4 w-4 text-red-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Reproducible Artifact
              </h3>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 text-[10px] font-mono font-semibold text-zinc-400">
                <Terminal className="h-3 w-3" />
                reproduce_failure_toctou.py
              </span>
              <span className="text-[9px] text-zinc-600">Exits with code 1</span>
            </div>
            <TerminalView lines={terminalOutput} isRunning={false} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transition to repair */}
      <AnimatePresence>
        {isBreached && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="flex items-center justify-center gap-2 text-[10px] text-zinc-500 py-1"
          >
            <ArrowRight className="h-3 w-3" />
            <span>Feeding failure trace to the repair engine...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
