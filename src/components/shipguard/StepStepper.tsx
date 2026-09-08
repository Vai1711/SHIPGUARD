import { cn } from "@/lib/utils";
import { Check, Shield, Swords, Wrench } from "lucide-react";

export type WorkflowStep = 1 | 2 | 3;

const STEP_META: Record<
  WorkflowStep,
  { label: string; caption: string; icon: typeof Shield }
> = {
  1: { label: "Formal Invariants", caption: "Spec extraction", icon: Shield },
  2: { label: "Adversarial Stress Test", caption: "Property-based attack", icon: Swords },
  3: { label: "Autonomous Repair & Audit", caption: "Patch + receipt", icon: Wrench },
};

export function StepStepper({
  current,
  maxReached,
  onStepSelect,
}: {
  current: WorkflowStep;
  maxReached: WorkflowStep;
  onStepSelect?: (step: WorkflowStep) => void;
}) {
  const steps: WorkflowStep[] = [1, 2, 3];

  return (
    <div className="glass rounded-xl px-4 py-3">
      <div className="flex items-center">
        {steps.map((step, i) => {
          const meta = STEP_META[step];
          const Icon = meta.icon;
          const isComplete = step < maxReached;
          const isActive = step === current;
          const isReachable = step <= maxReached;
          const clickable = isReachable && !isActive && !!onStepSelect;

          return (
            <div key={step} className={cn("flex items-center", i < steps.length - 1 && "flex-1")}>
              <button
                onClick={() => clickable && onStepSelect?.(step)}
                disabled={!clickable}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-all duration-300",
                  clickable && "hover:bg-white/[0.04] cursor-pointer",
                  !clickable && "cursor-default"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold transition-all duration-500",
                    isComplete
                      ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-300 shadow-sm shadow-emerald-500/20"
                      : isActive
                        ? "border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-md shadow-cyan-500/25 animate-pulse-glow-cyan"
                        : "border-white/[0.08] bg-white/[0.03] text-zinc-600"
                  )}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
                </span>
                <span className="hidden sm:flex flex-col items-start text-left">
                  <span
                    className={cn(
                      "text-[11px] font-bold uppercase tracking-wider transition-colors duration-300",
                      isComplete
                        ? "text-emerald-300"
                        : isActive
                          ? "text-cyan-300"
                          : "text-zinc-600"
                    )}
                  >
                    Step {step} · {meta.label}
                  </span>
                  <span className="text-[9px] text-zinc-600 font-mono">{meta.caption}</span>
                </span>
              </button>

              {i < steps.length - 1 && (
                <div className="relative mx-1.5 h-[2px] flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full transition-all duration-700",
                      step < maxReached ? "w-full bg-emerald-400/50" : "w-0"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
