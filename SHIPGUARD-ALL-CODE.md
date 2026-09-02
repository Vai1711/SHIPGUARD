# SHIPGUARD — All Source Code

This file contains every source file written for the SHIPGUARD project.
Copy each section into the corresponding file path in your project.

---

## File: index.html

```html
<!doctype html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/logo.svg" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SHIPGUARD — Adversarial Invariant Gate for AI Code</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
</head>


<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>

</html>
```

---

## File: src/index.css

```css
/* DO NOT CHANGE */
@import "tailwindcss";
@import "tw-animate-css";
@custom-variant dark (&:is(.dark *));

/* DO NOT CHANGE */
@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-cyan: #22d3ee;
  --color-amber: #fbbf24;
  --color-crimson: #ef4444;
  --color-emerald: #34d399;
  --color-glass-bg: rgba(255, 255, 255, 0.04);
  --color-glass-border: rgba(255, 255, 255, 0.08);
  --color-glass-highlight: rgba(255, 255, 255, 0.03);
}

/* Dark theme values */
:root {
  --radius: 0.625rem;
  --background: #09090b;
  --foreground: #fafafa;
  --card: rgba(255, 255, 255, 0.04);
  --card-foreground: #fafafa;
  --popover: rgba(18, 18, 24, 0.95);
  --popover-foreground: #fafafa;
  --primary: #22d3ee;
  --primary-foreground: #09090b;
  --secondary: rgba(255, 255, 255, 0.06);
  --secondary-foreground: #d4d4d8;
  --muted: rgba(255, 255, 255, 0.05);
  --muted-foreground: #71717a;
  --accent: rgba(34, 211, 238, 0.1);
  --accent-foreground: #67e8f9;
  --destructive: #ef4444;
  --border: rgba(255, 255, 255, 0.08);
  --input: rgba(255, 255, 255, 0.06);
  --ring: #22d3ee;
  --chart-1: #22d3ee;
  --chart-2: #34d399;
  --chart-3: #fbbf24;
  --chart-4: #a78bfa;
  --chart-5: #f472b6;
  --sidebar: #0f0f13;
  --sidebar-foreground: #fafafa;
  --sidebar-primary: #22d3ee;
  --sidebar-primary-foreground: #09090b;
  --sidebar-accent: rgba(34, 211, 238, 0.08);
  --sidebar-accent-foreground: #67e8f9;
  --sidebar-border: rgba(255, 255, 255, 0.06);
  --sidebar-ring: #22d3ee;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground font-sans antialiased;
    background-image:
      radial-gradient(ellipse 80% 60% at 50% -20%, rgba(34, 211, 238, 0.06), transparent),
      radial-gradient(ellipse 60% 50% at 80% 100%, rgba(52, 211, 153, 0.03), transparent);
  }
  button:not([disabled]),
  [role="button"]:not([disabled]) {
    cursor: pointer;
  }
}

/* Dark glassmorphism utility classes */
.glass {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(16px) saturate(1.5);
  -webkit-backdrop-filter: blur(16px) saturate(1.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.glass-strong {
  background: rgba(9, 9, 11, 0.85);
  backdrop-filter: blur(24px) saturate(1.8);
  -webkit-backdrop-filter: blur(24px) saturate(1.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.glass-subtle {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px) saturate(1.3);
  -webkit-backdrop-filter: blur(12px) saturate(1.3);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* Monospace font */
.font-mono {
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
}

/* Pulse glow animations — boosted for dark backgrounds */
@keyframes pulse-glow-cyan {
  0%, 100% { box-shadow: 0 0 10px rgba(34, 211, 238, 0.2); }
  50% { box-shadow: 0 0 24px rgba(34, 211, 238, 0.5), 0 0 48px rgba(34, 211, 238, 0.15); }
}

@keyframes pulse-glow-amber {
  0%, 100% { box-shadow: 0 0 10px rgba(251, 191, 36, 0.2); }
  50% { box-shadow: 0 0 24px rgba(251, 191, 36, 0.5), 0 0 48px rgba(251, 191, 36, 0.15); }
}

@keyframes pulse-glow-red {
  0%, 100% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.25); }
  50% { box-shadow: 0 0 28px rgba(239, 68, 68, 0.6), 0 0 56px rgba(239, 68, 68, 0.2); }
}

@keyframes pulse-glow-green {
  0%, 100% { box-shadow: 0 0 10px rgba(52, 211, 153, 0.2); }
  50% { box-shadow: 0 0 24px rgba(52, 211, 153, 0.5), 0 0 48px rgba(52, 211, 153, 0.15); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(2px); }
}

@keyframes border-flash-red {
  0%, 100% { border-color: rgba(239, 68, 68, 0.25); }
  50% { border-color: rgba(239, 68, 68, 0.85); }
}

@keyframes border-flash-green {
  0%, 100% { border-color: rgba(52, 211, 153, 0.25); }
  50% { border-color: rgba(52, 211, 153, 0.85); }
}

.animate-pulse-glow-cyan { animation: pulse-glow-cyan 2s ease-in-out infinite; }
.animate-pulse-glow-amber { animation: pulse-glow-amber 1.5s ease-in-out infinite; }
.animate-pulse-glow-red { animation: pulse-glow-red 1s ease-in-out infinite; }
.animate-pulse-glow-green { animation: pulse-glow-green 2s ease-in-out infinite; }
.animate-shake { animation: shake 0.5s ease-in-out; }
.animate-border-flash-red { animation: border-flash-red 1s ease-in-out infinite; }
.animate-border-flash-green { animation: border-flash-green 2s ease-in-out infinite; }
```

---

## File: src/components/shipguard/types.ts

```ts
export type DemoPhase =
  | "idle"
  | "extracting"
  | "contracts"
  | "attacking"
  | "breached"
  | "patching"
  | "verified";

export type InvariantStatus = "standby" | "evaluating" | "falsified" | "verified";

export type AttackVector = "boundary" | "replay" | "toctou";

export interface Invariant {
  id: string;
  type: string;
  label: string;
  description: string;
  status: InvariantStatus;
}

export interface LedgerState {
  sender: number;
  receiver: number;
  total: number;
}

export const INVARIANTS: Invariant[] = [
  {
    id: "INV-001",
    type: "BOUNDARY",
    label: "Balance never < ₹0",
    description: "∀ account a: balance(a) ≥ 0",
    status: "standby",
  },
  {
    id: "INV-002",
    type: "CONSERVATION",
    label: "∑(Balances_post) == ∑(Balances_pre)",
    description: "Asset conservation under transfer: Σ(b_post) = Σ(b_pre)",
    status: "standby",
  },
  {
    id: "INV-003",
    type: "CONCURRENCY",
    label: "Idempotent under simultaneous execution",
    description: "∀ t1, t2: execute(t1 ∥ t2) ≡ sequential(t1, t2)",
    status: "standby",
  },
];

export const SPEC_TEXT = `R1: Non-Negative Balance — No account balance may go below zero.
R2: Asset Conservation — The sum of all account balances before a transfer must equal the sum after.
R3: Atomicity & Idempotency — Concurrent transfers must execute atomically; simultaneous execution must not produce double-spends or phantom currency.`;
```

---

## File: src/components/shipguard/StatusBadge.tsx

```tsx
import { cn } from "@/lib/utils";
import type { InvariantStatus } from "./types";
import { ShieldCheck, ShieldAlert, ShieldX, ShieldOff } from "lucide-react";

const statusConfig: Record<
  InvariantStatus,
  { label: string; className: string; icon: typeof ShieldCheck; glowClass: string }
> = {
  standby: {
    label: "STANDBY",
    className: "bg-white/[0.04] text-zinc-400 border-white/[0.08]",
    icon: ShieldOff,
    glowClass: "",
  },
  evaluating: {
    label: "EVALUATING",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/25",
    icon: ShieldAlert,
    glowClass: "animate-pulse-glow-amber",
  },
  falsified: {
    label: "FALSIFIED",
    className: "bg-red-500/10 text-red-400 border-red-500/30",
    icon: ShieldX,
    glowClass: "animate-pulse-glow-red",
  },
  verified: {
    label: "VERIFIED",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    icon: ShieldCheck,
    glowClass: "animate-pulse-glow-green",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: InvariantStatus;
  className?: string;
}) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-300",
        config.className,
        config.glowClass,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}
```

---

## File: src/components/shipguard/TerminalView.tsx

```tsx
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TerminalViewProps {
  lines: string[];
  isRunning?: boolean;
  className?: string;
}

export function TerminalView({ lines, isRunning = false, className }: TerminalViewProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-[#1e1e2e] overflow-hidden shadow-lg",
        className
      )}
    >
      {/* Terminal title bar */}
      <div className="flex items-center gap-2 bg-[#181825] px-3 py-1.5 border-b border-slate-700/50">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
        </div>
        <span className="text-[10px] font-mono text-slate-500 ml-2">
          shipguard@reproduce:~
        </span>
      </div>
      {/* Terminal body */}
      <div className="p-3 font-mono text-[11px] leading-5 max-h-40 overflow-y-auto">
        {lines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.2 }}
            className={cn(
              "whitespace-pre-wrap break-all",
              line.startsWith("$") && "text-cyan-400",
              line.includes("Error") && "text-red-400 font-semibold",
              line.includes("PASS") && "text-emerald-400",
              line.includes("FAIL") && "text-red-400",
              line.includes("AssertionError") && "text-red-400 font-semibold",
              line.includes("Exit code") && "text-amber-400",
              line.startsWith("#") && "text-slate-500 italic",
              !line.startsWith("$") &&
                !line.includes("Error") &&
                !line.includes("PASS") &&
                !line.includes("FAIL") &&
                !line.includes("AssertionError") &&
                !line.includes("Exit code") &&
                !line.startsWith("#") &&
                "text-slate-300"
            )}
          >
            {line}
          </motion.div>
        ))}
        {isRunning && (
          <div className="inline-block w-2 h-4 bg-cyan-400 animate-pulse mt-0.5" />
        )}
      </div>
    </div>
  );
}
```

---

## File: src/components/shipguard/TopNav.tsx

```tsx
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
          <span className="glass-subtle rounded-full px-3 py-1 text-[11px] font-mono font-medium text-zinc-300">
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
```

---

## File: src/components/shipguard/SpecColumn.tsx

```tsx
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
```

---

## File: src/components/shipguard/AttackArena.tsx

```tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { DemoPhase, AttackVector } from "./types";
import { TerminalView } from "./TerminalView";
import { Button } from "@/components/ui/button";
import {
  Flame,
  AlertTriangle,
  Swords,
  GitBranch,
  FileCode,
  Terminal,
  ArrowRight,
} from "lucide-react";

const attackVectors: { id: AttackVector; label: string; icon: typeof Flame; desc: string }[] = [
  { id: "boundary", label: "Boundary", icon: Flame, desc: "₹0 edge case" },
  { id: "replay", label: "Replay", icon: GitBranch, desc: "State mutation replay" },
  { id: "toctou", label: "TOCTOU", icon: Swords, desc: "Race condition" },
];

const timelineStepsA = [
  "Check Balance (₹1,000 >= ₹1,000) [OK]",
  "TOCTOU Delay 10ms",
  "Deduct ₹1,000",
  "Credit ₹1,000",
];

const timelineStepsB = [
  "Check Balance (₹1,000 >= ₹1,000) [OK]",
  "TOCTOU Delay 10ms",
  "Deduct ₹1,000",
  "Credit ₹1,000",
];

const terminalOutput = [
  "$ python reproduce_failure_toctou.py",
  "# Running concurrency attack with 2 threads...",
  "# Thread A: check_balance() → 1000 >= 1000 → OK",
  "# Thread B: check_balance() → 1000 >= 1000 → OK",
  "# Thread A: deduct(1000) → balance = 0",
  "# Thread B: deduct(1000) → balance = -1000 → INSUFFICIENT (but passed check!)",
  "# Thread A: credit(1000) → receiver = 2000",
  "# Thread B: credit(1000) → receiver = 2000",
  "",
  "AssertionError: Invariant INV-002 Falsified!",
  "  Asset sum mismatch: expected 1000, got 2000",
  "  Phantom currency generated: ₹1,000",
  "  Exit code: 1",
];

function ConcurrencyTimeline({ active }: { active: boolean }) {
  const [stepA, setStepA] = useState(-1);
  const [stepB, setStepB] = useState(-1);
  const [showBreach, setShowBreach] = useState(false);

  useEffect(() => {
    if (!active) {
      setStepA(-1);
      setStepB(-1);
      setShowBreach(false);
      return;
    }
    let aIdx = 0;
    let bIdx = 0;
    const interval = setInterval(() => {
      if (aIdx < timelineStepsA.length) {
        setStepA(aIdx);
        aIdx++;
      }
      if (aIdx >= 2 && bIdx < timelineStepsB.length) {
        setStepB(bIdx);
        bIdx++;
      }
      if (aIdx >= timelineStepsA.length && bIdx >= timelineStepsB.length) {
        clearInterval(interval);
        setTimeout(() => setShowBreach(true), 400);
      }
    }, 600);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className="space-y-3">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
        Concurrency Interleaving Timeline
      </h4>

      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 relative">
        {/* Thread A */}
        <div className="text-[10px] font-bold text-cyan-400 font-mono pt-0.5">Thread A</div>
        <div className="flex flex-col gap-1">
          {timelineStepsA.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: i <= stepA ? 1 : 0.15, x: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-mono transition-all duration-300",
                i <= stepA
                  ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                  : "bg-white/[0.02] text-zinc-600 border border-transparent"
              )}
            >
              <div
                className={cn(
                  "h-1.5 w-1.5 rounded-full flex-shrink-0",
                  i <= stepA ? "bg-cyan-400" : "bg-zinc-700"
                )}
              />
              {step}
            </motion.div>
          ))}
        </div>

        {/* Thread B */}
        <div className="text-[10px] font-bold text-violet-400 font-mono pt-0.5">Thread B</div>
        <div className="flex flex-col gap-1">
          {timelineStepsB.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: i <= stepB ? 1 : 0.15, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-mono transition-all duration-300",
                i <= stepB
                  ? "bg-violet-500/10 text-violet-300 border border-violet-500/20"
                  : "bg-white/[0.02] text-zinc-600 border border-transparent"
              )}
            >
              <div
                className={cn(
                  "h-1.5 w-1.5 rounded-full flex-shrink-0",
                  i <= stepB ? "bg-violet-400" : "bg-zinc-700"
                )}
              />
              {step}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Race condition warning beam */}
      <AnimatePresence>
        {showBreach && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-500/[0.08] via-red-500/[0.03] to-red-500/[0.08] border border-red-500/30 animate-border-flash-red" />
            <div className="relative flex items-center gap-2 rounded-lg bg-red-500/[0.06] border border-red-500/20 px-3 py-2.5">
              <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 animate-pulse" />
              <div>
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                  Critical Race Condition
                </p>
                <p className="text-[10px] text-red-400/70 font-mono">
                  Double-spend window exploited — both threads passed the balance check before either committed
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StateDifferential({ breached }: { breached: boolean }) {
  return (
    <div className="space-y-2">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
        State Differential Inspector
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {/* Pre-State */}
        <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5">
          <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
            Pre-State
          </p>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-500">Sender</span>
              <span className="font-mono font-semibold text-zinc-300">₹1,000</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-500">Receiver</span>
              <span className="font-mono font-semibold text-zinc-300">₹0</span>
            </div>
            <div className="border-t border-white/[0.06] pt-1 mt-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400 font-semibold">Total</span>
                <span className="font-mono font-bold text-zinc-200">₹1,000</span>
              </div>
            </div>
          </div>
        </div>
        {/* Post-State */}
        <div
          className={cn(
            "rounded-lg border p-2.5 transition-all duration-500",
            breached
              ? "bg-red-500/[0.06] border-red-500/20"
              : "bg-white/[0.03] border-white/[0.06]"
          )}
        >
          <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
            Post-State
          </p>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-500">Sender</span>
              <span className="font-mono font-semibold text-zinc-300">₹0</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-500">Receiver</span>
              <span className="font-mono font-semibold text-zinc-300">₹2,000</span>
            </div>
            <div className="border-t border-white/[0.06] pt-1 mt-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400 font-semibold">Total</span>
                <span
                  className={cn(
                    "font-mono font-bold",
                    breached ? "text-red-400" : "text-zinc-200"
                  )}
                >
                  ₹2,000
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delta badge */}
      <AnimatePresence>
        {breached && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-lg bg-red-500/[0.06] border border-red-500/20 px-3 py-2"
          >
            <span className="text-sm">🚨</span>
            <div>
              <p className="text-[10px] font-bold text-red-400 uppercase">
                +₹1,000 Phantom Currency Generated
              </p>
              <p className="text-[9px] text-red-400/60 font-mono">INV-002 breach — asset conservation violated</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AttackArena({
  phase,
  onLaunch,
}: {
  phase: DemoPhase;
  onLaunch: () => void;
}) {
  const [selectedVector, setSelectedVector] = useState<AttackVector>("toctou");
  const isAttacking = phase === "attacking";
  const isBreached = phase === "breached";
  const showTimeline = isAttacking || isBreached;
  const showTerminal = isBreached;
  const canLaunch = phase === "contracts";

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Attack Suite Trigger */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Swords className="h-4 w-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Adversarial Attack Suite
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {attackVectors.map((v) => {
            const Icon = v.icon;
            return (
              <button
                key={v.id}
                onClick={() => setSelectedVector(v.id)}
                disabled={!canLaunch}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border p-2.5 text-center transition-all duration-200",
                  selectedVector === v.id
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-sm shadow-amber-500/10"
                    : "bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:border-white/[0.12] hover:text-zinc-300",
                  !canLaunch && "opacity-40 cursor-not-allowed"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[10px] font-bold">{v.label}</span>
                <span className="text-[9px] text-zinc-600">{v.desc}</span>
              </button>
            );
          })}
        </div>
        <Button
          onClick={onLaunch}
          disabled={!canLaunch}
          size="sm"
          className="w-full gap-1.5 text-[11px] font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 shadow-md shadow-amber-500/20 transition-all disabled:opacity-40 disabled:shadow-none"
        >
          <Flame className="h-3.5 w-3.5" />
          Launch Adversarial Suite
        </Button>
      </div>

      {/* Concurrency Timeline */}
      <AnimatePresence>
        {showTimeline && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-4"
          >
            <ConcurrencyTimeline active={isAttacking || isBreached} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* State Differential */}
      <AnimatePresence>
        {(isBreached || showTimeline) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl p-4"
          >
            <StateDifferential breached={isBreached} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reproduce Artifact Drawer */}
      <AnimatePresence>
        {showTerminal && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <FileCode className="h-4 w-4 text-red-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Reproducible Artifact
              </h3>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 text-[10px] font-mono font-semibold text-zinc-400">
                <Terminal className="h-3 w-3" />
                reproduce_failure_toctou.py
              </span>
              <span className="text-[9px] text-zinc-600">Exits with code 1</span>
            </div>
            <TerminalView lines={terminalOutput} isRunning={false} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transition to repair */}
      <AnimatePresence>
        {isBreached && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="flex items-center justify-center gap-2 text-[10px] text-zinc-500 py-1"
          >
            <ArrowRight className="h-3 w-3" />
            <span>Feeding failure trace to the repair engine...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

## File: src/components/shipguard/RepairColumn.tsx

```tsx
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
```

---

## File: src/pages/Landing.tsx

```tsx
import { motion } from "framer-motion";
import { Shield, ArrowRight, Zap, Lock, Bug, Cpu, Sparkles, CheckCircle2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

const features = [
  {
    icon: Lock,
    title: "Specs to Invariants",
    desc: "Drop in natural-language requirements. SHIPGUARD distills them into formal, parameterizable mathematical contracts your CI pipeline can actually enforce.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  {
    icon: Bug,
    title: "Adversarial Stress Testing",
    desc: "Generates deterministic attacks — boundary extremes, replay sequences, TOCTOU concurrency races — engineered to break your code before your customers do.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    icon: Zap,
    title: "Sandbox Execution",
    desc: "Each test runs in an isolated subprocess. No LLM interpretation, no hallucinated verdicts — just exit codes, assertion traces, and reproducible artifacts.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    icon: Cpu,
    title: "Autonomous Repair",
    desc: "Failures feed back into a closed-loop repair agent with immutable spec boundaries. It patches the code, re-runs the full adversarial suite, and signs off — all without human babysitting.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
];

const trustedBy = [
  "Fortune 500 Fintech",
  "Series B SaaS Platform",
  "Healthcare AI Startup",
  "Open-Source Maintainers",
];

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex flex-col"
    >
      {/* Nav */}
      <nav className="glass-strong sticky top-0 z-50 border-b border-white/[0.06] px-6 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-cyan-400" />
            <span className="font-mono text-sm font-bold tracking-tight text-white">
              SHIPGUARD
              <span className="text-zinc-500 font-normal ml-1">//</span>
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => navigate("/auth")}
            className="gap-1.5 text-[11px] font-semibold bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-400/30"
          >
            Open Your Dashboard
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 py-24 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/[0.07] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-violet-500/[0.04] rounded-full blur-[100px]" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-4 py-1.5 mb-8">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                Adversarial Verification Gate for AI-Generated Code
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] mb-6">
              Your AI writes code.{" "}
              <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400">
                We make sure it actually works.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
              SHIPGUARD translates your requirements into formal invariants,
              stress-tests AI-generated code in an isolated sandbox to find
              the cracks, and forces autonomous repairs before any pull
              request ships. No vibes. No hallucinated reviews. Just proof.
            </p>

            <div className="flex items-center justify-center gap-3 mb-12">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="gap-2 font-semibold bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-lg shadow-cyan-500/25 px-8 transition-all hover:shadow-xl hover:shadow-cyan-400/30"
              >
                Open Your Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 font-medium border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white"
              >
                View Documentation
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-6 flex-wrap">
              {trustedBy.map((name) => (
                <div key={name} className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500/60" />
                  {name}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                  className="glass rounded-xl p-4 hover:bg-white/[0.06] transition-all duration-300 group"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${f.bg} border ${f.border}`}>
                      <Icon className={`h-4 w-4 ${f.color}`} />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-cyan-300 transition-colors">{f.title}</h3>
                  <p className="text-[11px] text-zinc-400 leading-5">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works strip */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="glass rounded-2xl p-6 sm:p-8">
            <h2 className="text-lg font-bold text-white mb-6 text-center">How it works — in four steps</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { step: "01", label: "Extract", desc: "Specs → formal invariants" },
                { step: "02", label: "Attack", desc: "Synthesize adversarial tests" },
                { step: "03", label: "Repair", desc: "Autonomous closed-loop patching" },
                { step: "04", label: "Verify", desc: "Re-run, sign, ship" },
              ].map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.15 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/[0.06] border border-white/[0.08] mb-2">
                    <span className="font-mono text-sm font-bold text-cyan-400">{s.step}</span>
                  </div>
                  <p className="text-xs font-bold text-white">{s.label}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-white mb-3">
              Stop shipping code you haven't stress-tested
            </h2>
            <p className="text-sm text-zinc-400 mb-6">
              Get your team's dashboard up and running in minutes. Connect your
              repo, drop in your specs, and let SHIPGUARD find the cracks
              before your users do.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="gap-2 font-semibold bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-lg shadow-cyan-500/25 px-8"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-strong border-t border-white/[0.06] px-6 py-4 mt-auto">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-zinc-600" />
            <span className="text-[10px] text-zinc-500 font-mono">
              SHIPGUARD v1.0 — Counterexample-guided adversarial verification
            </span>
          </div>
          <span className="text-[10px] text-zinc-600">
            Built for teams that take code quality personally
          </span>
        </div>
      </footer>
    </motion.div>
  );
}
```

---

## File: src/pages/Dashboard.tsx

```tsx
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
  extracting: "Translating your requirements into formal invariants...",
  contracts: "Invariants locked in — ready to stress-test",
  attacking: "Running adversarial attacks against your code...",
  breached: "Gotcha. Found a critical race condition — here's the proof.",
  patching: "Autonomous repair in progress — synthesizing a fix...",
  verified: "All 100 adversarial permutations passed. Ship it.",
};

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
                  CampusPay Ledger Service
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

          {/* Footer */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.06]">
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
```

---

*Generated with Codebuff 🤖*
