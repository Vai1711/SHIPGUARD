# SHIPGUARD — All Source Code

This file contains every source file for the SHIPGUARD project.
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
@import "tailwindcss";
@import "tw-animate-css";
@custom-variant dark (&:is(.dark *));
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
  * { @apply border-border outline-ring/50; }
  body {
    @apply bg-background text-foreground font-sans antialiased;
    background-image:
      radial-gradient(ellipse 80% 60% at 50% -20%, rgba(34, 211, 238, 0.06), transparent),
      radial-gradient(ellipse 60% 50% at 80% 100%, rgba(52, 211, 153, 0.03), transparent);
  }
  button:not([disabled]), [role="button"]:not([disabled]) { cursor: pointer; }
}
.glass {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(16px) saturate(1.5);
  -webkit-backdrop-filter: blur(16px) saturate(1.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03);
}
.glass-strong {
  background: rgba(9, 9, 11, 0.85);
  backdrop-filter: blur(24px) saturate(1.8);
  -webkit-backdrop-filter: blur(24px) saturate(1.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.04);
}
.glass-subtle {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px) saturate(1.3);
  -webkit-backdrop-filter: blur(12px) saturate(1.3);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.font-mono { font-family: 'JetBrains Mono', 'Fira Code', monospace; }
@keyframes pulse-glow-cyan { 0%,100%{box-shadow:0 0 10px rgba(34,211,238,0.2)} 50%{box-shadow:0 0 24px rgba(34,211,238,0.5),0 0 48px rgba(34,211,238,0.15)} }
@keyframes pulse-glow-amber { 0%,100%{box-shadow:0 0 10px rgba(251,191,36,0.2)} 50%{box-shadow:0 0 24px rgba(251,191,36,0.5),0 0 48px rgba(251,191,36,0.15)} }
@keyframes pulse-glow-red { 0%,100%{box-shadow:0 0 10px rgba(239,68,68,0.25)} 50%{box-shadow:0 0 28px rgba(239,68,68,0.6),0 0 56px rgba(239,68,68,0.2)} }
@keyframes pulse-glow-green { 0%,100%{box-shadow:0 0 10px rgba(52,211,153,0.2)} 50%{box-shadow:0 0 24px rgba(52,211,153,0.5),0 0 48px rgba(52,211,153,0.15)} }
@keyframes shake { 0%,100%{transform:translateX(0)} 10%,30%,50%,70%,90%{transform:translateX(-2px)} 20%,40%,60%,80%{transform:translateX(2px)} }
@keyframes border-flash-red { 0%,100%{border-color:rgba(239,68,68,0.25)} 50%{border-color:rgba(239,68,68,0.85)} }
@keyframes border-flash-green { 0%,100%{border-color:rgba(52,211,153,0.25)} 50%{border-color:rgba(52,211,153,0.85)} }
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
  | "idle" | "extracting" | "contracts" | "attacking" | "breached" | "patching" | "verified";
export type InvariantStatus = "standby" | "evaluating" | "falsified" | "verified";
export type AttackVector = "boundary" | "replay" | "toctou";
export interface Invariant {
  id: string; type: string; label: string; description: string; status: InvariantStatus;
}
export interface LedgerState { sender: number; receiver: number; total: number; }
export interface TargetFile { name: string; content: string; }
export const DEFAULT_TARGET_NAME = "campus_pay.py";
export const INVARIANTS: Invariant[] = [
  { id: "INV-001", type: "BOUNDARY", label: "Balance never < \u20b90", description: "\u2200 account a: balance(a) \u2265 0", status: "standby" },
  { id: "INV-002", type: "CONSERVATION", label: "\u2211(Balances_post) == \u2211(Balances_pre)", description: "Asset conservation under transfer", status: "standby" },
  { id: "INV-003", type: "CONCURRENCY", label: "Idempotent under simultaneous execution", description: "Concurrent execution must be equivalent to sequential", status: "standby" },
];
export const SPEC_TEXT = `R1: Non-Negative Balance\nR2: Asset Conservation\nR3: Atomicity & Idempotency`;
```

---

## File: src/components/shipguard/StatusBadge.tsx

```tsx
import { cn } from "@/lib/utils";
import type { InvariantStatus } from "./types";
import { ShieldCheck, ShieldAlert, ShieldX, ShieldOff } from "lucide-react";
const statusConfig: Record<InvariantStatus, { label: string; className: string; icon: typeof ShieldCheck; glowClass: string }> = {
  standby: { label: "STANDBY", className: "bg-white/[0.04] text-zinc-400 border-white/[0.08]", icon: ShieldOff, glowClass: "" },
  evaluating: { label: "EVALUATING", className: "bg-amber-500/10 text-amber-400 border-amber-500/25", icon: ShieldAlert, glowClass: "animate-pulse-glow-amber" },
  falsified: { label: "FALSIFIED", className: "bg-red-500/10 text-red-400 border-red-500/30", icon: ShieldX, glowClass: "animate-pulse-glow-red" },
  verified: { label: "VERIFIED", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25", icon: ShieldCheck, glowClass: "animate-pulse-glow-green" },
};
export function StatusBadge({ status, className }: { status: InvariantStatus; className?: string }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (<span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-300", config.className, config.glowClass, className)}>
    <Icon className="h-3 w-3" />{config.label}
  </span>);
}
```

---

## File: src/components/shipguard/TerminalView.tsx

```tsx
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
export function TerminalView({ lines, isRunning = false, className }: { lines: string[]; isRunning?: boolean; className?: string }) {
  return (<div className={cn("rounded-lg border border-slate-200 bg-[#1e1e2e] overflow-hidden shadow-lg", className)}>
    <div className="flex items-center gap-2 bg-[#181825] px-3 py-1.5 border-b border-slate-700/50">
      <div className="flex gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-red-400/80" /><div className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" /><div className="h-2.5 w-2.5 rounded-full bg-green-400/80" /></div>
      <span className="text-[10px] font-mono text-slate-500 ml-2">shipguard@reproduce:~</span>
    </div>
    <div className="p-3 font-mono text-[11px] leading-5 max-h-40 overflow-y-auto">
      {lines.map((line, i) => (<motion.div key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08, duration: 0.2 }} className={cn("whitespace-pre-wrap break-all", line.startsWith("$") && "text-cyan-400", line.includes("Error") && "text-red-400 font-semibold", line.includes("PASS") && "text-emerald-400", line.includes("FAIL") && "text-red-400", line.startsWith("#") && "text-slate-500 italic", !line.startsWith("$") && !line.includes("Error") && !line.includes("PASS") && !line.includes("FAIL") && !line.startsWith("#") && "text-slate-300")}>{line}</motion.div>))}
      {isRunning && <div className="inline-block w-2 h-4 bg-cyan-400 animate-pulse mt-0.5" />}
    </div>
  </div>);
}
```

---

## File: src/components/shipguard/TopNav.tsx

See full file in project: src/components/shipguard/TopNav.tsx
- Imports: DemoPhase, DEFAULT_TARGET_NAME from types
- Props: phase, onRunGate, onReset, isDemoMode, onToggleDemo, targetName?
- Renders: SHIPGUARD // logo, pulsing GATE status badge, target pill (emerald when custom), Demo toggle, Run Full Gate CTA, Reset

---

## File: src/components/shipguard/SpecColumn.tsx

See full file in project: src/components/shipguard/SpecColumn.tsx
- Props: phase, invariants, onExtract, onTargetChange?
- Features: .py file upload with chip + content preview, IBM Bob attribution, collapsible spec card, 3 invariant contract cards

---

## File: src/components/shipguard/AttackArena.tsx

See full file in project: src/components/shipguard/AttackArena.tsx
- Props: phase, onLaunch, targetName?
- Features: attack vector selector, animated Thread A/B concurrency timeline, red breach beam, state differential, streaming terminal with dynamic target name

---

## File: src/components/shipguard/RepairColumn.tsx

See full file in project: src/components/shipguard/RepairColumn.tsx
- Props: phase, onInvokeRepair
- Features: autonomous patch trigger, animated code diff, SVG radial gauge 0→100%, cryptographic audit receipt with copy button

---

## File: src/pages/Landing.tsx

See full file in project: src/pages/Landing.tsx
- Dark glassmorphism landing page with B2B copy
- Hero: "Your AI writes code. We make sure it actually works."
- Features grid, how-it-works strip, social proof, CTAs → /auth → /dashboard

---

## File: src/pages/Dashboard.tsx

See full file in project: src/pages/Dashboard.tsx
- Orchestrator: owns all demo state (phase, invariants, targetFile, breach flash, demo mode)
- 4-step state machine: idle → extracting → contracts → attacking → breached → patching → verified
- 3-column bento grid: SpecColumn | AttackArena | RepairColumn
- Engine info strip: "Deterministic Engine (No LLM)" with technique labels
- Backend integration indicator when real results are available

---

## File: src/convex/invariantGate.ts

See full file in project: src/convex/invariantGate.ts
- Convex action with `"use node"` for Node.js API access
- 3 actions: extractInvariants, runAdversarialSuite, applyRepair
- Bridges Python backend via subprocess execution
- Returns structured JSON results for frontend consumption

---

## Python Backend: backend/

See full files in project: backend/
```
backend/
├── main.py                          # CLI entry point / full pipeline runner
├── requirements.txt                 # hypothesis, libcst, pytest
├── contracts/
│   ├── __init__.py
│   ├── schemas.py                   # Invariant, AttackResult, PatchResult, VerificationReceipt dataclasses
│   └── extractor.py                 # AST-based invariant extractor (zero LLM)
├── target_service/
│   ├── __init__.py
│   ├── campus_pay.py                # Buggy version with TOCTOU race condition
│   └── campus_pay_patched.py        # Thread-safe patched version
├── synthesizer/
│   ├── __init__.py
│   └── attack_synthesizer.py        # Hypothesis property-based testing
├── sandbox/
│   ├── __init__.py
│   ├── runner.py                    # Isolated subprocess pytest runner
│   └── artifact_generator.py        # Reproducible failure artifact generator
└── repair/
    ├── __init__.py
    └── repair_engine.py             # LibCST AST transformation engine
```

---

*Generated with Codebuff*