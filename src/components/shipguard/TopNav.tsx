import { cn } from "@/lib/utils";
import type { DemoPhase } from "./types";
import { DEFAULT_TARGET_NAME } from "./types";
import { Button } from "@/components/ui/button";
import { Shield, Play, RotateCcw, Zap } from "lucide-react";

const phaseLabels: Record<DemoPhase, string> = {
  idle: "STANDBY",
  extracting: "EXTRACTING",
  contracts: "ARMED",
  attacking: "EVALUATING",
  breached: "BREACHED",
  patching: "REPAIRING",
  verified: "VERIFIED",
};

const phaseDotColors: Record<DemoPhase, string> = {
  idle: "bg-zinc-500",
  extracting: "bg-cyan-400",
  contracts: "bg-cyan-400",
  attacking: "bg-amber-400",
  breached: "bg-red-500",
  patching: "bg-amber-400",
  verified: "bg-emerald-400",
};

export function TopNav({
  phase,
  onRunGate,
  onReset,
  isDemoMode,
  onToggleDemo,
  targetName = DEFAULT_TARGET_NAME,
}: {
  phase: DemoPhase;
  onRunGate: () => void;
  onReset: () => void;
  isDemoMode: boolean;
  onToggleDemo: () => void;
  targetName?: string;
}) {
  const label = phaseLabels[phase];
  const dotColor = phaseDotColors[phase];

  return (
    <header className="glass-strong sticky top-0 z-50 border-b border-white/[0.06] px-4 py-2.5 sm:px-6">
      <div className="mx-auto flex max-w-[1920px] items-center justify-between gap-4">
        {/* Logo + Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-cyan-400" />
            <span className="font-mono text-sm font-bold tracking-tight text-white">
              SHIPGUARD
              <span className="text-zinc-600 font-normal ml-1">//</span>
            </span>
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-500",
              phase === "breached"
                ? "bg-red-500/10 text-red-400 border-red-500/30 animate-pulse-glow-red"
                : phase === "verified"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 animate-pulse-glow-green"
                  : phase === "attacking" || phase === "patching"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", dotColor, phase !== "idle" && "animate-pulse")} />
            GATE: {label}
          </div>
        </div>

        {/* Target context */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            Target:
          </span>
          <span
            className={cn(
              "glass-subtle rounded-full px-3 py-1 text-[11px] font-mono font-medium text-zinc-300",
              targetName !== DEFAULT_TARGET_NAME && "text-emerald-300 border-emerald-500/30"
            )}
          >
            {targetName} (Python 3.11)
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onToggleDemo}
            className={cn(
              "gap-1.5 text-[11px] font-medium border-white/10 text-zinc-400 hover:text-white hover:bg-white/5",
              isDemoMode && "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/15"
            )}
          >
            <Zap className="h-3 w-3" />
            Demo
          </Button>
          <Button
            size="sm"
            onClick={onRunGate}
            disabled={phase !== "idle" && phase !== "contracts" && phase !== "verified"}
            className="gap-1.5 text-[11px] font-semibold bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-400/30 disabled:opacity-40 disabled:shadow-none disabled:hover:bg-cyan-500"
          >
            <Play className="h-3 w-3" />
            Run Full Gate
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onReset}
            className="gap-1.5 text-[11px] font-medium border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        </div>
      </div>
    </header>
  );
}
