import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { DemoPhase, Invariant } from "./types";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { FileText, Brain, ChevronDown, ChevronUp } from "lucide-react";

export function SpecColumn({
  phase,
  invariants,
  onExtract,
}: {
  phase: DemoPhase;
  invariants: Invariant[];
  onExtract: () => void;
}) {
  const [specExpanded, setSpecExpanded] = useState(true);
  const isExtracting = phase === "extracting";
  const showContracts = phase === "contracts" || phase === "attacking" || phase === "breached" || phase === "patching" || phase === "verified";

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Spec Card */}
      <div className="glass rounded-xl p-4 transition-all duration-300">
        <button
          onClick={() => setSpecExpanded(!specExpanded)}
          className="flex items-center justify-between w-full text-left mb-2"
        >
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Your Requirements
            </h3>
          </div>
          {specExpanded ? (
            <ChevronUp className="h-3.5 w-3.5 text-zinc-500" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
          )}
        </button>
        <AnimatePresence>
          {specExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3 mb-3">
                <pre className="font-mono text-[11px] leading-5 text-zinc-400 whitespace-pre-wrap">
{`R1: Non-Negative Balance
  No account balance may drop below zero.

R2: Asset Conservation
  Sum of all balances must stay constant across transfers.

R3: Atomicity & Idempotency
  Concurrent transfers must be atomic — no double-spends,
  no phantom currency, no race conditions.`}
                </pre>
              </div>
              <Button
                onClick={onExtract}
                disabled={isExtracting || showContracts}
                size="sm"
                className="w-full gap-2 text-[11px] font-semibold bg-violet-500 hover:bg-violet-400 text-white shadow-md shadow-violet-500/20 transition-all disabled:opacity-40 disabled:shadow-none"
              >
                {isExtracting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Extracting formal invariants...
                  </>
                ) : (
                  <>
                    <Brain className="h-3.5 w-3.5" />
                    Extract Formal Invariants
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Invariant Contracts */}
      <AnimatePresence>
        {showContracts && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col gap-2.5"
          >
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-1">
              Formal Invariant Contracts
            </h3>
            {invariants.map((inv, i) => (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15, duration: 0.3 }}
                className={cn(
                  "glass rounded-xl p-3.5 transition-all duration-500 border-l-[3px]",
                  inv.status === "falsified" && "border-l-red-500 animate-shake bg-red-500/[0.06]",
                  inv.status === "verified" && "border-l-emerald-500 bg-emerald-500/[0.04]",
                  inv.status === "evaluating" && "border-l-amber-500 bg-amber-500/[0.04]",
                  inv.status === "standby" && "border-l-zinc-600"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-zinc-400 bg-white/[0.06] rounded px-1.5 py-0.5">
                      {inv.id}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      {inv.type}
                    </span>
                  </div>
                  <StatusBadge status={inv.status} />
                </div>
                <p className="text-xs font-semibold text-zinc-200 mb-1">{inv.label}</p>
                <p className="font-mono text-[10px] text-zinc-500 leading-4">{inv.description}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
