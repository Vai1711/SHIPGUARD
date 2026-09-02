import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { DemoPhase, Invariant } from "@/components/shipguard/types";
import { INVARIANTS } from "@/components/shipguard/types";
import { TopNav } from "@/components/shipguard/TopNav";
import { SpecColumn } from "@/components/shipguard/SpecColumn";
import { AttackArena } from "@/components/shipguard/AttackArena";
import { RepairColumn } from "@/components/shipguard/RepairColumn";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Shield } from "lucide-react";
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

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [phase, setPhase] = useState<DemoPhase>("idle");
  const [invariants, setInvariants] = useState<Invariant[]>(INVARIANTS);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showBreachFlash, setShowBreachFlash] = useState(false);

  const resetDemo = useCallback(() => {
    setPhase("idle");
    setInvariants(INVARIANTS.map((i) => ({ ...i, status: "standby" })));
    setShowBreachFlash(false);
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
            className="fixed inset-0 z-[60] pointer-events-none border-4 border-red-500/40 rounded-none"
            style={{
              boxShadow: "inset 0 0 80px rgba(239, 68, 68, 0.15)",
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
            className="fixed inset-0 z-[60] pointer-events-none border-4 border-emerald-500/30 rounded-none"
            style={{
              boxShadow: "inset 0 0 60px rgba(16, 185, 129, 0.08)",
            }}
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
      />

      {/* Main content */}
      <main className="flex-1 px-3 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1920px]">
          {/* Phase indicator */}
          <div className="flex items-center justify-center gap-1 mb-4">
            {phases.map((p, i) => (
              <div
                key={p}
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  p === phase ? "w-8 bg-cyan-500" : "w-3 bg-slate-200",
                  i < currentPhaseIndex ? "bg-emerald-300" : ""
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
              />
            </div>

            {/* Column 2: Attack Arena */}
            <div className="min-h-0">
              <AttackArena
                phase={phase}
                onLaunch={handleLaunchAttack}
              />
            </div>

            {/* Column 3: Repair & Audit */}
            <div className="min-h-0">
              <RepairColumn
                phase={phase}
                onInvokeRepair={handleInvokeRepair}
              />
            </div>
          </div>

          {/* Footer user info */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-slate-300" />
              <span className="text-[10px] text-slate-400 font-mono">
                SHIPGUARD v1.0 — Adversarial Invariant Gate for AI Code
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-400">
                {user?.name ? `Operator: ${user.name}` : "Operator: Guest"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await signOut();
                }}
                className="gap-1 text-[10px] text-slate-400 hover:text-slate-600 h-7"
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
