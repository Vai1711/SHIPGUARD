import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Invariant } from "./types";
import { StatusBadge } from "./StatusBadge";
import { ScrollText } from "lucide-react";

export function InvariantContracts({
  invariants,
  compact = false,
}: {
  invariants: Invariant[];
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="glass rounded-xl p-3">
        <div className="flex items-center gap-2 mb-2">
          <ScrollText className="h-3.5 w-3.5 text-cyan-400" />
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Armed Invariant Contracts
          </h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {invariants.map((inv, i) => (
            <motion.span
              key={inv.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold transition-all duration-500",
                inv.status === "falsified" &&
                  "border-red-500/40 bg-red-500/10 text-red-300",
                inv.status === "verified" &&
                  "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
                inv.status === "evaluating" &&
                  "border-amber-500/40 bg-amber-500/10 text-amber-300",
                inv.status === "standby" &&
                  "border-white/[0.08] bg-white/[0.04] text-zinc-400"
              )}
            >
              {inv.id} · {inv.type}
            </motion.span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
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
    </div>
  );
}
