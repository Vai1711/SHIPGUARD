import { useState, useCallback, useRef, useEffect } from "react";
import type { RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { DemoPhase, Invariant, TargetFile } from "@/components/shipguard/types";
import { INVARIANTS, DEFAULT_TARGET_NAME } from "@/components/shipguard/types";
import type { InvariantWithExpression } from "@/components/shipguard/predicates";
import { deriveInvariants, analyzeSource } from "@/components/shipguard/analysis";
import {
  findFalsifiedInvariant,
  type AttackContext,
} from "@/components/shipguard/predicates";
import { TopNav } from "@/components/shipguard/TopNav";
import { SpecColumn } from "@/components/shipguard/SpecColumn";
import { AttackArena } from "@/components/shipguard/AttackArena";
import { RepairColumn } from "@/components/shipguard/RepairColumn";
import { InvariantContracts } from "@/components/shipguard/InvariantContracts";
import { StepStepper, type WorkflowStep } from "@/components/shipguard/StepStepper";
import { useAuth } from "@/hooks/use-auth";
import {
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function DemoModeRunner({
  phase,
  onAdvance,
  onAccept,
}: {
  phase: DemoPhase;
  onAdvance: () => void;
  onAccept: () => void;
}) {
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    const schedule = (fn: () => void, delay: number) => {
      const t = setTimeout(fn, delay);
      timeoutsRef.current.push(t);
    };

    switch (phase) {
      case "idle":
        // Gated: opening the gate plays the whole demo end-to-end.
        schedule(onAccept, 1500);
        break;
      case "extracting":
        schedule(onAdvance, 2500);
        break;
      case "contracts":
        // Gated: auto-launch the attack suite.
        schedule(onAccept, 3000);
        break;
      case "attacking":
        schedule(onAdvance, 4000);
        break;
      case "breached":
        // Gated: auto-invoke the repair, then slide to Step 3.
        schedule(onAccept, 3000);
        break;
      case "patching":
        schedule(onAdvance, 4000);
        break;
      case "verified":
        break;
    }
  }, [phase, onAdvance, onAccept]);

  return null;
}

/**
 * Gated phase transitions: idle → extracting requires the user's explicit
 * go-ahead (the extract button), contracts → attacking requires the attack
 * launch, breached → patching requires the repair CTA. In demo mode all
 * gates open automatically so the demo plays end-to-end.
 */
function isGatedPhase(phase: DemoPhase): boolean {
  return (
    phase === "idle" || phase === "contracts" || phase === "breached"
  );
}

const phaseDescriptions: Record<DemoPhase, string> = {
  idle: "Waiting for you to kick things off",
  extracting: "Translating your requirements into formal invariants via AST parsing...",
  contracts: "Invariants locked in — ready to stress-test",
  attacking: "Running adversarial attacks via Hypothesis property-based testing...",
  breached: "Gotcha. Found a critical race condition — here's the proof.",
  patching: "Autonomous repair in progress — applying LibCST AST transformation...",
  verified: "All 100 adversarial permutations passed. Ship it.",
};

const stepHeadline: Record<WorkflowStep, string> = {
  1: "Specify the target — the gate derives formal contracts",
  2: "Attack the contracts with adversarial property tests",
  3: "Auto-patch the falsified invariant and audit the fix",
};

/**
 * Which workflow step does this phase belong to? Note that "contracts"
 * maps to Step 2: the moment extraction completes, the view slides into
 * the Attack Arena (flow automation).
 */
function stepForPhase(phase: DemoPhase): WorkflowStep {
  switch (phase) {
    case "idle":
    case "extracting":
      return 1;
    case "contracts":
    case "attacking":
    case "breached":
      return 2;
    default:
      return 3;
  }
}

/** Highest step the user has unlocked (drives stepper completion/reachability). */
function maxStepForPhase(phase: DemoPhase): WorkflowStep {
  switch (phase) {
    case "idle":
    case "extracting":
      return 1;
    case "contracts":
      // Contracts are armed → Step 2 is reachable but not yet visited.
      return 2;
    case "attacking":
    case "breached":
      // Breach proof unlocks the repair stage.
      return 3;
    case "patching":
    case "verified":
      return 3;
    default:
      return 1;
  }
}

/**
 * The deterministic demo attack: two threads double-spend through the
 * check-then-act window. The captured context is fed through the user's
 * edited invariant expressions to decide the verdict.
 */
function buildAttackContext(): AttackContext {
  return {
    pre_sender: 1000,
    pre_receiver: 0,
    pre_total: 1000,
    post_sender: -1000,
    post_receiver: 2000,
    post_total: 2000,
    amount: 1000,
  };
}

const slideVariants = {
  enter: (direction: 1 | -1) => ({
    x: direction > 0 ? "60%" : "-60%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: 1 | -1) => ({
    x: direction > 0 ? "-60%" : "60%",
    opacity: 0,
  }),
};

/**
 * Smoothly scrolls the main stage into view when the active step changes,
 * so newly revealed content (timeline, terminal, diff) below the fold is
 * always in sight. Respects user scroll position when pinned.
 */
function useStepScrollEffect(stageRef: RefObject<HTMLElement | null>, activeStep: WorkflowStep) {
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    // Only scroll when the stage top is above the comfortable viewing band.
    if (rect.top < 96) {
      stage.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep]);
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [phase, setPhase] = useState<DemoPhase>("idle");
  const [invariants, setInvariants] = useState<InvariantWithExpression[]>(
    INVARIANTS.map((i) => ({
      ...i,
      expression:
        i.id === "INV-001"
          ? "post_sender >= 0 and post_receiver >= 0"
          : "post_total == pre_total",
    }))
  );
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showBreachFlash, setShowBreachFlash] = useState(false);
  const [targetFile, setTargetFile] = useState<TargetFile | null>(null);
  // null = follow the phase automatically; set only by explicit Back/Next clicks.
  const [pinnedStep, setPinnedStep] = useState<WorkflowStep | null>(null);
  const [[step, direction], setStepState] = useState<[WorkflowStep, 1 | -1]>([1, 1]);
  const targetName = targetFile?.name ?? DEFAULT_TARGET_NAME;
  const stageRef = useRef<HTMLDivElement>(null);

  const currentStep = stepForPhase(phase);
  const maxStep = maxStepForPhase(phase);
  const activeStep = pinnedStep ?? currentStep;
  useStepScrollEffect(stageRef, activeStep);

  // Keep a pinned step from outliving its unlock window (e.g. after Reset).
  useEffect(() => {
    if (pinnedStep !== null && pinnedStep > maxStep) {
      setPinnedStep(null);
    }
  }, [pinnedStep, maxStep]);

  // Sync the carousel to the phase unless the user pinned a manual view.
  // A deliberate hold delays the slide slightly so the just-finished step's
  // results register before the view moves on.
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (pinnedStep !== null) return;
    if (step === currentStep) return;
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    holdTimerRef.current = setTimeout(() => {
      setStepState(([prevStep]) => {
        if (prevStep === currentStep) return [prevStep, 1];
        return [currentStep, currentStep > prevStep ? 1 : -1];
      });
    }, 700);
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    };
  }, [currentStep, pinnedStep, step]);

  const goToStep = useCallback(
    (target: WorkflowStep) => {
      if (target === step) return;
      setPinnedStep(target);
      setStepState(([prevStep]) => [target, target > prevStep ? 1 : -1]);
    },
    [step]
  );

  const releasePin = useCallback(() => {
    setPinnedStep(null);
    setStepState(([prevStep]) => {
      if (prevStep === currentStep) return [prevStep, 1];
      return [currentStep, currentStep > prevStep ? 1 : -1];
    });
  }, [currentStep]);

  const resetDemo = useCallback(() => {
    setPhase("idle");
    setInvariants(INVARIANTS.map((i) => ({ ...i, status: "standby" })));
    setShowBreachFlash(false);
    setPinnedStep(null);
  }, []);

  // Persist a user-edited invariant (label + formal description) across the
  // attack, repair, and audit phases.
  const handleUpdateInvariant = useCallback((updated: Invariant) => {
    setInvariants((prev) =>
      prev.map((inv) =>
        inv.id === updated.id
          ? { ...inv, label: updated.label, description: updated.description }
          : inv
      )
    );
  }, []);

  // Custom pasted sources get their contracts derived live from the code;
  // the preset keeps the canonical CampusPay contracts.
  const handleTargetChange = useCallback((file: TargetFile | null) => {
    setTargetFile(file);
    if (file && file.name === "pasted_target.py") {
      const { report } = analyzeSource(file.content);
      if (report) {
        setInvariants(deriveInvariants(report));
      }
    } else if (!file) {
      setInvariants(INVARIANTS.map((i) => ({ ...i, status: "standby" })));
    }
  }, []);

  const advancePhase = useCallback(() => {
    setPhase((prev) => {
      switch (prev) {
        case "idle":
          return "extracting";
        case "extracting":
          return "contracts";
        case "contracts":
          return "attacking";
        case "attacking":
          return "breached";
        case "breached":
          return "patching";
        case "patching":
          return "verified";
        case "verified":
          return "verified";
        default:
          return prev;
      }
    });
  }, []);

  /** Open the phase's user gate (extract / launch attack / invoke repair). */
  const acceptGate = useCallback(() => {
    setPhase((prev) => {
      switch (prev) {
        case "idle":
          return "extracting";
        case "contracts":
          return "attacking";
        case "breached":
          return "patching";
        default:
          return prev;
      }
    });
  }, []);

  // Anti-stall guard: in-flight phases (extracting / attacking / patching)
  // always auto-advance, in every mode. Demo mode additionally auto-accepts
  // the gated phases so the demo plays end-to-end unattended.
  useEffect(() => {
    if (isGatedPhase(phase)) {
      if (isDemoMode) {
        const t = setTimeout(() => acceptGate(), 100);
        return () => clearTimeout(t);
      }
      return;
    }
    // Spinner phases: bounded runtimes that always resolve forward.
    const delays: Partial<Record<DemoPhase, number>> = {
      extracting: 2500,
      attacking: 4000,
      patching: 4000,
    };
    const delay = delays[phase];
    if (delay) {
      const t = setTimeout(() => advancePhase(), delay);
      return () => clearTimeout(t);
    }
  }, [phase, isDemoMode, acceptGate, advancePhase]);

  // Update invariant statuses based on phase. On breach, the falsified
  // contract is decided by genuinely evaluating each user-edited predicate
  // expression against the captured attack context.
  useEffect(() => {
    setInvariants((prev) => {
      switch (phase) {
        case "attacking":
          return prev.map((inv) => ({ ...inv, status: "evaluating" as const }));
        case "breached": {
          const verdict = findFalsifiedInvariant(prev, buildAttackContext());
          return prev.map((inv) => ({
            ...inv,
            status:
              verdict && inv.id === verdict.invariant.id
                ? ("falsified" as const)
                : ("evaluating" as const),
          }));
        }
        case "patching":
        case "verified":
          return prev.map((inv) => ({ ...inv, status: "verified" as const }));
        default:
          return prev;
      }
    });

    if (phase === "breached") {
      setShowBreachFlash(true);
      const t = setTimeout(() => setShowBreachFlash(false), 2000);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const handleRunGate = useCallback(() => {
    if (phase === "idle" || phase === "contracts" || phase === "verified") {
      if (phase === "verified") resetDemo();
      setTimeout(() => advancePhase(), 100);
    }
  }, [phase, advancePhase, resetDemo]);

  const handleExtract = useCallback(() => {
    if (phase === "idle") {
      advancePhase();
    }
  }, [phase, advancePhase]);

  const handleLaunchAttack = useCallback(() => {
    if (phase === "contracts") {
      advancePhase();
    }
  }, [phase, advancePhase]);

  // The attack's verdict context + falsified contract, derived from the live
  // (user-edited) invariants, are threaded into the arena for the terminal
  // feed and state-differential display.
  const attackContext = buildAttackContext();
  const breachVerdict = findFalsifiedInvariant(invariants, attackContext);

  const handleInvokeRepair = useCallback(() => {
    if (phase === "breached") {
      advancePhase();
    }
  }, [phase, advancePhase]);

  // Breach CTA: slide into Step 3 and kick off the autonomous patch.
  const handleBreachRepair = useCallback(() => {
    if (phase !== "breached") return;
    if (!isDemoMode) goToStep(3);
    advancePhase();
  }, [phase, isDemoMode, goToStep, advancePhase]);

  // Stepper clicks: navigate to that step's page (back or forward, up to
  // the furthest unlocked step).
  const handleStepSelect = useCallback(
    (target: WorkflowStep) => {
      goToStep(target);
    },
    [goToStep]
  );

  const phases: DemoPhase[] = ["idle", "extracting", "contracts", "attacking", "breached", "patching", "verified"];
  const currentPhaseIndex = phases.indexOf(phase);

  // Navigation is available in every mode — including demo playback. Going
  // back/forward pins the view so the auto-runner doesn't yank it away.
  const canGoBack = activeStep > 1;
  const canGoNext = activeStep < Math.min(3, maxStep);

  const handleBack = () => {
    if (!canGoBack) return;
    if (pinnedStep !== null) {
      goToStep((activeStep - 1) as WorkflowStep);
    } else {
      goToStep((currentStep - 1) as WorkflowStep);
    }
  };

  const handleNext = () => {
    if (!canGoNext) return;
    const base = pinnedStep ?? currentStep;
    goToStep((base + 1) as WorkflowStep);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Breach flash overlay */}
      <AnimatePresence>
        {showBreachFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] pointer-events-none border-4 border-red-500/30 rounded-none"
            style={{
              boxShadow: "inset 0 0 100px rgba(239, 68, 68, 0.1)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Verified glow overlay */}
      <AnimatePresence>
        {phase === "verified" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] pointer-events-none border-4 border-emerald-500/20 rounded-none animate-border-flash-green"
          />
        )}
      </AnimatePresence>

      {/* Demo mode runner */}
      {isDemoMode && (
        <DemoModeRunner
          phase={phase}
          onAdvance={advancePhase}
          onAccept={acceptGate}
        />
      )}

      {/* Top Nav */}
      <TopNav
        phase={phase}
        onRunGate={handleRunGate}
        onReset={resetDemo}
        isDemoMode={isDemoMode}
        onToggleDemo={() => setIsDemoMode((v) => !v)}
        targetName={targetName}
      />

      {/* Main content — focused single-stage workflow */}
      <main className="flex-1 px-3 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Workflow stepper */}
          <StepStepper
            current={activeStep}
            maxReached={maxStep}
            onStepSelect={handleStepSelect}
          />

          {/* Step headline + phase descriptor */}
          <div className="mt-4 mb-3 text-center px-2">
            <h1 className="text-base sm:text-lg font-bold text-white">
              {stepHeadline[activeStep]}
            </h1>
            <p
              className={cn(
                "text-[11px] mt-1 font-mono",
                phase === "breached"
                  ? "text-red-400"
                  : phase === "verified"
                    ? "text-emerald-400"
                    : "text-zinc-500"
              )}
            >
              {phaseDescriptions[phase]}
            </p>
          </div>

          {/* Phase indicator dots */}
          <div className="flex items-center justify-center gap-1 mb-4">
            {phases.map((p, i) => (
              <div
                key={p}
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  p === phase ? "w-8 bg-cyan-400" : "w-3 bg-white/10",
                  i < currentPhaseIndex ? "bg-emerald-400/50" : ""
                )}
              />
            ))}
          </div>

          {/* Single-stage carousel with slide transitions */}
          <div ref={stageRef} className="relative overflow-hidden rounded-2xl">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={activeStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              >
                {activeStep === 1 && (
                  <SpecColumn
                    phase={phase}
                    invariants={invariants}
                    onExtract={handleExtract}
                    onTargetChange={handleTargetChange}
                    onUpdateInvariant={handleUpdateInvariant}
                  />
                )}

                {activeStep === 2 && (
                  <div className="flex flex-col gap-3">
                    <InvariantContracts
                      invariants={invariants}
                      compact
                      onUpdateInvariant={handleUpdateInvariant}
                    />
                    <AttackArena
                      phase={phase}
                      onLaunch={handleLaunchAttack}
                      targetName={targetName}
                      invariants={invariants}
                      breach={breachVerdict}
                      context={attackContext}
                    />
                    <AnimatePresence>
                      {phase === "breached" && (
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                        >
                          <Button
                            onClick={handleBreachRepair}
                            size="sm"
                            className="w-full gap-2 text-[11px] font-semibold bg-violet-500 hover:bg-violet-400 text-white shadow-md shadow-violet-500/20 transition-all"
                          >
                            <Wrench className="h-3.5 w-3.5" />
                            Invoke Autonomous Patch — continue to Step 3
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="flex flex-col gap-3">
                    <InvariantContracts
                      invariants={invariants}
                      compact
                      onUpdateInvariant={handleUpdateInvariant}
                    />
                    <RepairColumn
                      phase={phase}
                      onInvokeRepair={handleInvokeRepair}
                      invariants={invariants}
                      targetName={targetName}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Back / Next navigation */}
          <div className="mt-4 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              disabled={!canGoBack}
              className="gap-1.5 text-[11px] font-semibold border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back
            </Button>

            {pinnedStep !== null && pinnedStep !== currentStep && (
              <button
                onClick={releasePin}
                className="text-[10px] font-mono text-cyan-400/80 hover:text-cyan-300 underline underline-offset-2 transition-colors"
              >
                follow live phase (step {currentStep})
              </button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={!canGoNext}
              className="gap-1.5 text-[11px] font-semibold border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-200 disabled:opacity-30 disabled:border-white/10 disabled:text-zinc-500 disabled:hover:bg-transparent"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Verified banner */}
          <AnimatePresence>
            {phase === "verified" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.07] px-4 py-3"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <p className="text-[11px] font-semibold text-emerald-300">
                  Gate passed — merge unlocked. Receipt signed and archived.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Backend engine info strip */}
          <div className="mt-4 glass rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-2 w-2 rounded-full bg-cyan-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Deterministic Engine (No LLM)
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] text-zinc-500 font-mono">
              <span>Invariant Extraction: Python AST parser</span>
              <span>Adversarial Testing: Hypothesis (PBT) + SMT</span>
              <span>Autonomous Repair: LibCST AST rewriting</span>
              <span>Sandbox: Isolated subprocess execution</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-zinc-600" />
              <span className="text-[10px] text-zinc-600 font-mono">
                SHIPGUARD v1.0 — Adversarial invariant gate for AI code
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-zinc-500">
                {user?.name ? `Team: ${user.name}` : "Team: Demo Workspace"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await signOut();
                }}
                className="gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 h-7"
              >
                <LogOut className="h-3 w-3" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
