import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { DemoPhase, Invariant, TargetFile } from "@/components/shipguard/types";
import { INVARIANTS, DEFAULT_TARGET_NAME } from "@/components/shipguard/types";
import { deriveInvariants, analyzeSource } from "@/components/shipguard/analysis";
import { TopNav } from "@/components/shipguard/TopNav";
import { SpecColumn } from "@/components/shipguard/SpecColumn";
import { AttackArena } from "@/components/shipguard/AttackArena";
import { RepairColumn } from "@/components/shipguard/RepairColumn";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

function DemoModeRunner({
  phase,
  onAdvance,
}: {
  phase: DemoPhase;
  onAdvance: () => void;
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

    const scheduleAdvance = (delay: number) => {
      const t = setTimeout(() => {
        onAdvance();
      }, delay);
      timeoutsRef.current.push(t);
    };

    switch (phase) {
      case "idle":
        scheduleAdvance(1500);
        break;
      case "extracting":
        scheduleAdvance(2500);
        break;
      case "contracts":
        scheduleAdvance(3000);
        break;
      case "attacking":
        scheduleAdvance(4000);
        break;
      case "breached":
        scheduleAdvance(3000);
        break;
      case "patching":
        scheduleAdvance(4000);
        break;
      case "verified":
        break;
    }
  }, [phase, onAdvance]);

  return null;
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

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [phase, setPhase] = useState<DemoPhase>("idle");
  const [invariants, setInvariants] = useState<Invariant[]>(INVARIANTS);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showBreachFlash, setShowBreachFlash] = useState(false);
  const [targetFile, setTargetFile] = useState<TargetFile | null>(null);
  const targetName = targetFile?.name ?? DEFAULT_TARGET_NAME;

  const resetDemo = useCallback(() => {
    setPhase("idle");
    setInvariants(INVARIANTS.map((i) => ({ ...i, status: "standby" })));
    setShowBreachFlash(false);
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

  // Update invariant statuses based on phase
  useEffect(() => {
    setInvariants((prev) =>
      prev.map((inv) => {
        switch (phase) {
          case "attacking":
            return { ...inv, status: "evaluating" as const };
          case "breached":
            return {
              ...inv,
              status:
                inv.id === "INV-002" ? "falsified" : "evaluating",
            };
          case "patching":
          case "verified":
            return { ...inv, status: "verified" as const };
          default:
            return inv;
        }
      })
    );

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

  const handleInvokeRepair = useCallback(() => {
    if (phase === "breached") {
      advancePhase();
    }
  }, [phase, advancePhase]);

  const phases: DemoPhase[] = ["idle", "extracting", "contracts", "attacking", "breached", "patching", "verified"];
  const currentPhaseIndex = phases.indexOf(phase);

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
      {isDemoMode && <DemoModeRunner phase={phase} onAdvance={advancePhase} />}

      {/* Top Nav */}
      <TopNav
        phase={phase}
        onRunGate={handleRunGate}
        onReset={resetDemo}
        isDemoMode={isDemoMode}
        onToggleDemo={() => setIsDemoMode((v) => !v)}
        targetName={targetName}
      />

      {/* Main content */}
      <main className="flex-1 px-3 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1920px]">
          {/* Dashboard header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-bold text-white">
                Command Center
                <span className="text-zinc-500 font-normal ml-2 text-sm">
                  {targetName}
                </span>
              </h1>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {phaseDescriptions[phase]}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                <Clock className="h-3 w-3" />
                <span className="font-mono">
                  {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          </div>

          {/* Phase indicator */}
          <div className="flex items-center gap-1 mb-4">
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

          {/* 3-Column Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[28%_44%_28%] gap-3 xl:gap-4 items-start">
            {/* Column 1: Spec & Contracts */}
            <div className="min-h-0">
              <SpecColumn
                phase={phase}
                invariants={invariants}
                onExtract={handleExtract}
                onTargetChange={handleTargetChange}
              />
            </div>

            {/* Column 2: Attack Arena */}
            <div className="min-h-0">
              <AttackArena
                phase={phase}
                onLaunch={handleLaunchAttack}
                targetName={targetName}
              />
            </div>

            {/* Column 3: Repair & Audit */}
            <div className="min-h-0">
              <RepairColumn
                phase={phase}
                onInvokeRepair={handleInvokeRepair}
                invariants={invariants}
                targetName={targetName}
              />
            </div>
          </div>

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
