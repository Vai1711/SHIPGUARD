import { cn } from "@/lib/utils";
import type { DemoPhase } from "./types";
import { Button } from "@/components/ui/button";
import { Shield, Play, RotateCcw, Zap } from "lucide-react";

const phaseLabels: Record<DemoPhase, string> = {
  idle: "STANDBY",
  extracting: "EXTRACTING",
  contracts: "ARMED",
  attacking: "EVALUATING",
  breached: "BREACHED",
  patching: "PATCHING",
  verified: "VERIFIED",
};

const phaseDotColors: Record<DemoPhase, string> = {
  idle: "bg-slate-400",
  extracting: "bg-cyan-400",
  contracts: "bg-cyan-500",
  attacking: "bg-amber-400",
  breached: "bg-red-500",
  patching: "bg-amber-400",
  verified: "bg-emerald-500",
};

export function TopNav({
  phase,
  onRunGate,
  onReset,
  isDemoMode,
  onToggleDemo,
}: {
  phase: DemoPhase;
  onRunGate: () => void;
  onReset: () => void;
  isDemoMode: boolean;
  onToggleDemo: () => void;
}) {
  const label = phaseLabels[phase];
  const dotColor = phaseDotColors[phase];

  return (
    <header className="glass-strong sticky top-0 z-50 border-b border-white/40 px-4 py-2.5 sm:px-6">
      <div className="mx-auto flex max-w-[1920px] items-center justify-between gap-4">
        {/* Logo + Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-cyan-600" />
            <span className="font-mono text-sm font-bold tracking-tight text-slate-800">
              SHIPGUARD
              <span className="text-slate-400 font-normal ml-1">//</span>
            </span>
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-500",
              phase === "breached"
                ? "bg-red-50 text-red-600 border-red-200 animate-pulse-glow-red"
                : phase === "verified"
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200 animate-pulse-glow-green"
                  : "bg-cyan-50 text-cyan-700 border-cyan-200"
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", dotColor, phase !== "idle" && "animate-pulse")} />
            GATE: {label}
          </div>
        </div>

        {/* Target context */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Target:
          </span>
          <span className="glass-subtle rounded-full px-3 py-1 text-[11px] font-mono font-medium text-slate-600">
            CampusPay Ledger Service (Python 3.11)
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onToggleDemo}
            className={cn(
              "gap-1.5 text-[11px] font-medium border-slate-200",
              isDemoMode && "bg-cyan-50 border-cyan-300 text-cyan-700"
            )}
          >
            <Zap className="h-3 w-3" />
            Demo
          </Button>
          <Button
            size="sm"
            onClick={onRunGate}
            disabled={phase !== "idle" && phase !== "contracts" && phase !== "verified"}
            className="gap-1.5 text-[11px] font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-md shadow-cyan-200 transition-all hover:shadow-lg hover:shadow-cyan-300/40 disabled:opacity-50 disabled:shadow-none"
          >
            <Play className="h-3 w-3" />
            Run Full Invariant Gate
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onReset}
            className="gap-1.5 text-[11px] font-medium border-slate-200 text-slate-600"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        </div>
      </div>
    </header>
  );
}
