import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { DemoPhase, AttackVector } from "./types";
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
  { id: "toctou", label: "TOCTOU Concurrency", icon: Swords, desc: "Race condition" },
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

const terminalOutput = [
  "$ python reproduce_failure_toctou.py",
  "# Running concurrency attack with 2 threads...",
  "# Thread A: check_balance() → 1000 >= 1000 → OK",
  "# Thread B: check_balance() → 1000 >= 1000 → OK",
  "# Thread A: deduct(1000) → balance = 0",
  "# Thread B: deduct(1000) → balance = -1000 → INSUFFICIENT (but passed check!)",
  "# Thread A: credit(1000) → receiver = 2000",
  "# Thread B: credit(1000) → receiver = 2000",
  "",
  "AssertionError: Invariant INV-002 Falsified!",
  "  Asset sum mismatch: expected 1000, got 2000",
  "  Phantom currency generated: ₹1,000",
  "  Exit code: 1",
];

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
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        Concurrency Interleaving Timeline
      </h4>

      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 relative">
        {/* Thread A */}
        <div className="text-[10px] font-bold text-cyan-600 font-mono pt-0.5">Thread A</div>
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
                  ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
                  : "bg-slate-50 text-slate-300 border border-transparent"
              )}
            >
              <div
                className={cn(
                  "h-1.5 w-1.5 rounded-full flex-shrink-0",
                  i <= stepA ? "bg-cyan-500" : "bg-slate-200"
                )}
              />
              {step}
            </motion.div>
          ))}
        </div>

        {/* Thread B */}
        <div className="text-[10px] font-bold text-violet-600 font-mono pt-0.5">Thread B</div>
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
                  ? "bg-violet-50 text-violet-700 border border-violet-200"
                  : "bg-slate-50 text-slate-300 border border-transparent"
              )}
            >
              <div
                className={cn(
                  "h-1.5 w-1.5 rounded-full flex-shrink-0",
                  i <= stepB ? "bg-violet-500" : "bg-slate-200"
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
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-100 via-red-50 to-red-100 border border-red-300 animate-border-flash-red" />
            <div className="relative flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 animate-pulse" />
              <div>
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                  CRITICAL RACE CONDITION
                </p>
                <p className="text-[10px] text-red-500 font-mono">
                  Double-Spend Window Exploited — Both threads passed balance check before either committed
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StateDifferential({ breached }: { breached: boolean }) {
  return (
    <div className="space-y-2">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        State Differential Inspector
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {/* Pre-State */}
        <div className="rounded-lg bg-white/60 border border-slate-100 p-2.5">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Pre-State
          </p>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">Sender</span>
              <span className="font-mono font-semibold text-slate-700">₹1,000</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">Receiver</span>
              <span className="font-mono font-semibold text-slate-700">₹0</span>
            </div>
            <div className="border-t border-slate-100 pt-1 mt-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500 font-semibold">Total</span>
                <span className="font-mono font-bold text-slate-800">₹1,000</span>
              </div>
            </div>
          </div>
        </div>
        {/* Post-State */}
        <div
          className={cn(
            "rounded-lg border p-2.5 transition-all duration-500",
            breached
              ? "bg-red-50/80 border-red-200"
              : "bg-white/60 border-slate-100"
          )}
        >
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Post-State
          </p>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">Sender</span>
              <span className="font-mono font-semibold text-slate-700">₹0</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">Receiver</span>
              <span className="font-mono font-semibold text-slate-700">₹2,000</span>
            </div>
            <div className="border-t border-slate-100 pt-1 mt-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500 font-semibold">Total</span>
                <span
                  className={cn(
                    "font-mono font-bold",
                    breached ? "text-red-600" : "text-slate-800"
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
            className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2"
          >
            <span className="text-sm">🚨</span>
            <div>
              <p className="text-[10px] font-bold text-red-600 uppercase">
                +₹1,000 Phantom Currency Generated
              </p>
              <p className="text-[9px] text-red-400 font-mono">INV-002 BREACH — Asset conservation violated</p>
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
}: {
  phase: DemoPhase;
  onLaunch: () => void;
}) {
  const [selectedVector, setSelectedVector] = useState<AttackVector>("toctou");
  const isAttacking = phase === "attacking";
  const isBreached = phase === "breached";
  const showTimeline = isAttacking || isBreached;
  const showTerminal = isBreached;
  const canLaunch = phase === "contracts";

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Attack Suite Trigger */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Swords className="h-4 w-4 text-amber-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
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
                    ? "bg-amber-50 border-amber-300 text-amber-700 shadow-sm shadow-amber-100"
                    : "bg-white/40 border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-500",
                  !canLaunch && "opacity-50 cursor-not-allowed"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[10px] font-bold">{v.label}</span>
                <span className="text-[9px] text-slate-400">{v.desc}</span>
              </button>
            );
          })}
        </div>
        <Button
          onClick={onLaunch}
          disabled={!canLaunch}
          size="sm"
          className="w-full gap-1.5 text-[11px] font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-200 transition-all disabled:opacity-50"
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
            <StateDifferential breached={isBreached} />
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
              <FileCode className="h-4 w-4 text-red-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Reproducible Artifact
              </h3>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 border border-slate-200 px-2.5 py-1 text-[10px] font-mono font-semibold text-slate-600">
                <Terminal className="h-3 w-3" />
                reproduce_failure_toctou.py
              </span>
              <span className="text-[9px] text-slate-400">Exits with code 1</span>
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
            className="flex items-center justify-center gap-2 text-[10px] text-slate-400 py-1"
          >
            <ArrowRight className="h-3 w-3" />
            <span>Feeding failure trace to repair engine...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
