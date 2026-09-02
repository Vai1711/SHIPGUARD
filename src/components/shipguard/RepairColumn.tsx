import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { DemoPhase } from "./types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Wrench,
  Code,
  CheckCircle2,
  Copy,
  FileCheck,
  Cpu,
  Lock,
  BadgeCheck,
  ShieldCheck,
} from "lucide-react";

const diffLines = [
  { type: "removed" as const, text: "  self.balances[from_acc] -= amount" },
  { type: "removed" as const, text: "  self.balances[to_acc] += amount" },
  { type: "added" as const, text: "  with self._lock:" },
  { type: "added" as const, text: "      if self.balances[from_acc] >= amount:" },
  { type: "added" as const, text: "          self.balances[from_acc] -= amount" },
  { type: "added" as const, text: "          self.balances[to_acc] += amount" },
];

function DiffViewer({ visible }: { visible: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 8 }}
      transition={{ duration: 0.5 }}
      className="rounded-lg border border-white/[0.08] overflow-hidden bg-white/[0.02] shadow-lg"
    >
      <div className="flex items-center gap-2 bg-white/[0.03] border-b border-white/[0.06] px-3 py-1.5">
        <Code className="h-3 w-3 text-zinc-500" />
        <span className="text-[10px] font-mono font-semibold text-zinc-400">
          campus_pay_patched.py
        </span>
        <span className="text-[9px] text-emerald-400 ml-auto font-semibold">+2 removed, +4 added</span>
      </div>
      <div className="p-2 font-mono text-[10px] leading-5">
        {diffLines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: visible ? 1 : 0, x: 0 }}
            transition={{ delay: visible ? 0.3 + i * 0.1 : 0, duration: 0.3 }}
            className={cn(
              "px-2 rounded-sm",
              line.type === "removed" && "bg-red-500/[0.08] text-red-400",
              line.type === "added" && "bg-emerald-500/[0.08] text-emerald-400"
            )}
          >
            <span className="text-zinc-600 select-none mr-2">
              {line.type === "removed" ? "−" : "+"}
            </span>
            {line.text}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function RadialGauge({ progress, visible }: { progress: number; visible: boolean }) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-20 flex-shrink-0">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-white/[0.06]"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={visible ? offset : circumference}
            strokeLinecap="round"
            className={cn(
              "transition-all duration-1000 ease-out drop-shadow-lg",
              progress === 100 ? "text-emerald-400" : "text-cyan-400"
            )}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(
            "font-mono text-sm font-bold",
            progress === 100 ? "text-emerald-400" : "text-zinc-300"
          )}>
            {progress}%
          </span>
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          Test Permutations
        </p>
        <p className="text-xs font-semibold text-zinc-300 mt-0.5">
          {Math.round(progress)} / 100 passed
        </p>
        {progress === 100 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] text-emerald-400 font-semibold mt-0.5"
          >
            All adversarial permutations verified ✓
          </motion.p>
        )}
      </div>
    </div>
  );
}

function AuditReceipt({ visible }: { visible: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const receipt = `SHIPGUARD VERIFICATION RECEIPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STATUS: 🟢 VERIFIED & SIGNED
COMMIT HASH: sha256:7f3a9e2b4c8d1f6e3a7b9c2d4e8f1a3b5c7d9e2f4a6b8c0d2e4f6a8b1c3d5e7
TARGET: CampusPay Ledger Service (Python 3.11)
INVARIANTS VERIFIED: 3/3
GATE DECISION: MERGE APPROVED (CI/CD UNLOCKED)
TIMESTAMP: ${new Date().toISOString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    navigator.clipboard.writeText(receipt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.9 }}
      transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
      className="rounded-xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.08] to-white/[0.02] p-4 shadow-xl shadow-emerald-500/10"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: visible ? 1 : 0 }}
            transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
          >
            <BadgeCheck className="h-6 w-6 text-emerald-400" />
          </motion.div>
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              Cryptographic Verification
            </h4>
            <p className="text-[9px] text-emerald-400/60 font-mono">Immutable audit receipt</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[11px] font-semibold text-zinc-300">STATUS:</span>
          <span className="text-[11px] font-bold text-emerald-400">🟢 VERIFIED & SIGNED</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-zinc-500" />
          <span className="text-[11px] font-semibold text-zinc-300">COMMIT:</span>
          <span className="font-mono text-[10px] text-zinc-400">sha256:7f3a9e2b4c...</span>
        </div>
        <div className="flex items-center gap-2">
          <FileCheck className="h-3.5 w-3.5 text-zinc-500" />
          <span className="text-[11px] font-semibold text-zinc-300">DECISION:</span>
          <span className="text-[11px] font-bold text-emerald-400">MERGE APPROVED (CI/CD UNLOCKED)</span>
        </div>
      </div>

      <Button
        onClick={handleCopy}
        size="sm"
        variant="outline"
        className="w-full gap-1.5 text-[10px] font-semibold border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
      >
        {copied ? (
          <>
            <CheckCircle2 className="h-3 w-3" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" />
            Copy CI/CD Receipt
          </>
        )}
      </Button>
    </motion.div>
  );
}

export function RepairColumn({
  phase,
  onInvokeRepair,
}: {
  phase: DemoPhase;
  onInvokeRepair: () => void;
}) {
  const [testProgress, setTestProgress] = useState(0);
  const isPatching = phase === "patching";
  const isVerified = phase === "verified";
  const canInvoke = phase === "breached";
  const showDiff = isPatching || isVerified;
  const showGauge = isPatching || isVerified;
  const showReceipt = isVerified;

  useEffect(() => {
    if (!isPatching && !isVerified) {
      setTestProgress(0);
      return;
    }
    if (isVerified) {
      setTestProgress(100);
      return;
    }
    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      setTestProgress(Math.min(current, 100));
      if (current >= 100) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [isPatching, isVerified]);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Autonomous Repair Trigger */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="h-4 w-4 text-violet-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Autonomous Repair
          </h3>
        </div>

        <Button
          onClick={onInvokeRepair}
          disabled={!canInvoke}
          size="sm"
          className="w-full gap-1.5 text-[11px] font-semibold bg-violet-500 hover:bg-violet-400 text-white shadow-md shadow-violet-500/20 transition-all disabled:opacity-40 disabled:shadow-none mb-3"
        >
          {isPatching ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              >
                <Wrench className="h-3.5 w-3.5" />
              </motion.div>
              Synthesizing thread-safe mutex lock...
            </>
          ) : (
            <>
              <Wrench className="h-3.5 w-3.5" />
              Invoke Autonomous Patch
            </>
          )}
        </Button>

        <AnimatePresence>
          {isPatching && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 bg-violet-500/[0.06] rounded-lg border border-violet-500/20 px-3 py-2 mb-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="h-2 w-2 rounded-full bg-violet-400"
                />
                <span className="text-[10px] font-mono text-violet-300">
                  Analyzing invariant contracts... synthesizing lock pattern...
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Diff Viewer */}
      <AnimatePresence>
        {showDiff && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Code className="h-4 w-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Unified Code Diff
              </h3>
            </div>
            <DiffViewer visible={showDiff} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Re-Verification Gauge */}
      <AnimatePresence>
        {showGauge && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Re-Verification Progress
              </h3>
            </div>
            <RadialGauge progress={testProgress} visible={showGauge} />
            {!isVerified && (
              <div className="mt-3">
                <Progress value={testProgress} className="h-1.5 bg-white/[0.06]" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audit Receipt */}
      <AnimatePresence>
        {showReceipt && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AuditReceipt visible={showReceipt} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
