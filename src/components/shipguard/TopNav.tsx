import { useState } from "react";
import { cn } from "@/lib/utils";
import type { DemoPhase } from "./types";
import { DEFAULT_TARGET_NAME } from "./types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Play, RotateCcw, Zap, GitPullRequest, Copy, Check } from "lucide-react";

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

const GITHUB_ACTION_YAML = `# .github/workflows/shipguard.yml
# SHIPGUARD adversarial invariant gate — blocks merges on falsified contracts.
name: SHIPGUARD Invariant Gate

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  invariant-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      - name: Install SHIPGUARD engine dependencies
        run: pip install -r backend/requirements.txt

      - name: Run adversarial invariant gate
        id: gate
        run: |
          python backend/main.py \\
            --target backend/target_service/campus_pay.py \\
            --json-out gate_report.json

      - name: Enforce gate decision
        run: |
          python - <<'PY'
          import json, sys
          report = json.load(open("gate_report.json"))
          if report["decision"] != "MERGE APPROVED":
              print("SHIPGUARD gate FAILED:", report["decision"])
              sys.exit(1)
          print("SHIPGUARD gate PASSED — merge approved")
          PY

      - name: Upload audit receipt artifact
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: shipguard-audit-receipt
          path: gate_report.json
`;

const PRE_COMMIT_YAML = `# .pre-commit-config.yaml
# Local hook: blocks commits whose diffs falsify any invariant contract.
repos:
  - repo: local
    hooks:
      - id: shipguard-invariant-gate
        name: SHIPGUARD invariant gate
        entry: python backend/main.py --staged --fail-on-breach
        language: system
        pass_filenames: false
        files: '\\.py$'
        stages: [pre-commit]

      - id: shipguard-receipt-check
        name: SHIPGUARD audit receipt present
        entry: python backend/main.py --verify-receipt shipguard_receipt.json
        language: system
        pass_filenames: false
        stages: [pre-push]
`;

function CopyBlock({ title, code }: { title: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-white/[0.08] overflow-hidden bg-[#0b0b10]">
      <div className="flex items-center justify-between bg-white/[0.03] border-b border-white/[0.06] px-3 py-1.5">
        <span className="text-[10px] font-mono font-semibold text-zinc-400">
          {title}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[9px] font-mono font-semibold text-zinc-500 hover:text-cyan-300 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" /> copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" /> copy
            </>
          )}
        </button>
      </div>
      <pre className="max-h-72 overflow-auto p-3 font-mono text-[9.5px] leading-4 text-zinc-400 whitespace-pre">
        {code}
      </pre>
    </div>
  );
}

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
  const [showCicd, setShowCicd] = useState(false);
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
          <span className={cn("glass-subtle rounded-full px-3 py-1 text-[11px] font-mono font-medium text-zinc-300", targetName !== DEFAULT_TARGET_NAME && "text-emerald-300 border border-emerald-500/30")}>
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
            variant="outline"
            onClick={() => setShowCicd(true)}
            className="gap-1.5 text-[11px] font-medium border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
          >
            <GitPullRequest className="h-3 w-3" />
            CI/CD Setup
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

      {/* CI/CD Integration Modal */}
      <Dialog open={showCicd} onOpenChange={setShowCicd}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto border-white/10 bg-[#0c0c11] text-zinc-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold tracking-tight">
              <GitPullRequest className="h-4 w-4 text-cyan-400" />
              Ship SHIPGUARD into your pipeline
            </DialogTitle>
            <DialogDescription className="text-[11px] text-zinc-500">
              Drop either config into your repo. The gate runs the same deterministic
              engine — falsified invariants block the merge, verified ones unlock it.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="github-action" className="gap-3">
            <TabsList className="bg-white/[0.04] border border-white/[0.06] h-8">
              <TabsTrigger
                value="github-action"
                className="text-[10px] font-semibold data-[state=active]:bg-cyan-500/15 data-[state=active]:text-cyan-300"
              >
                .github/workflows/shipguard.yml
              </TabsTrigger>
              <TabsTrigger
                value="pre-commit"
                className="text-[10px] font-semibold data-[state=active]:bg-cyan-500/15 data-[state=active]:text-cyan-300"
              >
                .pre-commit-config.yaml
              </TabsTrigger>
            </TabsList>
            <TabsContent value="github-action">
              <CopyBlock title=".github/workflows/shipguard.yml" code={GITHUB_ACTION_YAML} />
              <p className="mt-2 text-[9px] font-mono text-zinc-600">
                Runs on every PR. Exit code 1 = invariant falsified = merge blocked.
              </p>
            </TabsContent>
            <TabsContent value="pre-commit">
              <CopyBlock title=".pre-commit-config.yaml" code={PRE_COMMIT_YAML} />
              <p className="mt-2 text-[9px] font-mono text-zinc-600">
                Runs locally on <span className="text-zinc-400">git commit</span> for .py
                files and re-verifies the receipt on push.
              </p>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </header>
  );
}
