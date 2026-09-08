```markdown
# SHIPGUARD 🛡️
### Deterministic Adversarial Invariant Gate for AI-Generated Code

> **Zero LLM Hallucinations. Zero External API Costs. Pure Formal Verification.**  
> Built as an automated, independent verification harness for autonomous code generation agents (such as **IBM Bob**).

---

## 📌 Executive Summary

Autonomous coding agents (e.g., IBM Bob) can generate functional software rapidly, but they suffer from **concurrency blindness**—frequently emitting race conditions (TOCTOU), non-atomic ledger operations, and boundary errors. 

**SHIPGUARD** acts as an automated verification gate. Before agentic code is merged into production, SHIPGUARD:
1. **Extracts formal invariants** statically using Python AST (`ast`).
2. **Synthesizes adversarial stress tests** using property-based fuzzing (`Hypothesis`) and barrier synchronization to expose counterexamples.
3. **Autonomously repairs** broken source code using deterministic Abstract Syntax Tree rewrites (`LibCST`).
4. **Issues a cryptographic SHA-256 audit certificate**, unlocking the CI/CD deployment pipeline only when 100% of concurrency interleavings pass.

---

## 🏛️ System Architecture


```

```
                   [ AI Agent (IBM Bob) ]
                             │  (Generates Python Service)
                             ▼

```

┌─────────────────────────────────────────────────────────────────┐
│                    SHIPGUARD VERIFICATION GATE                  │
│                                                                 │
│  [1. Static Extraction]                                         │
│       Python AST Parser ──► Extracts Formal Invariant Contracts │
│                                                                 │
│  [2. Adversarial Fuzzing]                                       │
│       Hypothesis Engine ──► Concurrency Barrier Interleaving   │
│                                        │                        │
│                                        ▼ (Breach Exposed)       │
│  [3. Deterministic AST Repair]                                  │
│       LibCST Transformer ──► Injects Thread-Safe Mutex / Locks  │
│                                        │                        │
│                                        ▼                        │
│  [4. Permutation Re-Verification]                              │
│       100 Iterations Fuzzed ──► SHA-256 Signed Audit Receipt    │
└────────────────────────────────┬────────────────────────────────┘
│
▼
[ CI/CD Merge Unlocked ]

```

---

## ⚡ Core Pillars

* **100% Deterministic & Offline:** No LLM-in-the-loop during verification or patching. Eliminates temperature variance, prompt drift, token costs, and network latency. Sub-100ms pipeline execution.
* **Editable Invariant Contracts:** Supports user-defined predicates (e.g., Non-Negative Bounds, Asset Conservation, and Concurrency Idempotency) that bind directly into the fuzzing harness.
* **Autonomous AST Repair:** Rewrites broken syntax trees deterministically with `libcst` to inject `threading.RLock()` structures without altering surrounding business logic.
* **Zero-Crash Client-Side Architecture:** The web dashboard runs a resilient React/TypeScript state machine, paired with an isolated local Python testbed.

---

## 📁 Repository Structure

```text
shipguard-gate/
├── backend/                             # Deterministic Python Verification Engine
│   ├── contracts/
│   │   ├── extractor.py                 # AST-based static invariant extractor
│   │   └── schemas.py                   # Data contracts for Invariants & Receipts
│   ├── repair/
│   │   └── repair_engine.py             # LibCST AST mutation & lock injector
│   ├── sandbox/
│   │   ├── artifact_generator.py        # Reproducible failure artifact builder
│   │   └── runner.py                    # Isolated subprocess test execution harness
│   ├── synthesizer/
│   │   └── attack_synthesizer.py        # Hypothesis / Barrier-based race attacker
│   ├── target_service/
│   │   ├── campus_pay.py                # Vulnerable ledger (TOCTOU race bug)
│   │   └── campus_pay_patched.py        # Verified, thread-safe patched ledger
│   ├── main.py                          # Full CLI verification pipeline runner
│   └── requirements.txt                 # Python dependencies (hypothesis, libcst, pytest)
│
├── src/                                 # Vite + React + Tailwind Command Center
│   ├── components/shipguard/
│   │   ├── AttackArena.tsx              # Thread concurrency visualization & terminal stream
│   │   ├── InvariantContracts.tsx       # Editable formal invariant cards
│   │   ├── RepairColumn.tsx             # AST diff viewer & cryptographic audit certificate
│   │   ├── SpecColumn.tsx               # Source ingestion, custom upload & IBM Bob synthesis
│   │   ├── StepStepper.tsx              # 3-Step focused workflow wizard
│   │   ├── TerminalView.tsx             # Simulated real-time execution stream
│   │   ├── TopNav.tsx                   # System status & CI/CD hook modal
│   │   ├── analysis.ts                  # Client-side static code analysis & parsing
│   │   ├── diff.ts                      # Unified diff computation engine
│   │   └── types.ts                     # TypeScript definitions & default contracts
│   ├── pages/
│   │   ├── Dashboard.tsx                # Central state orchestrator
│   │   └── Landing.tsx                  # Project landing page
│   └── index.css                        # Glassmorphism & custom animation styles
│
├── package.json
└── vite.config.ts

```

---

## 🚀 Quickstart Guide

### Prerequisites

* **Node.js** (v18+) or **Bun**
* **Python** (v3.10+)

### 1. Web Command Center (Frontend)

```bash
# Clone the repository
git clone [https://github.com/Vai1711/shipguard-gate.git](https://github.com/Vai1711/shipguard-gate.git)
cd shipguard-gate

# Install frontend dependencies
bun install
# or: npm install

# Launch development server
bun run dev
# or: npm run dev

```

Open **`http://localhost:5173`** to access the interactive dashboard.

---

### 2. Formal Verification Engine (Backend CLI)

Run the Python verification suite locally to see the AST extractor and property-based test runner in action:

```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the complete deterministic gate pipeline
python main.py

```

To run the isolated counterexample reproduction script (exposing the concurrency race condition with exit code `1`):

```bash
python sandbox/reproduce_failure_toctou.py

```

---

## 🔒 Formal Invariant Specifications

SHIPGUARD tests code against three mathematical contracts:

| ID | Class | Formal Expression | Failure Symptom |
| --- | --- | --- | --- |
| **INV-001** | Boundary | $\forall a \in Accounts: \text{balance}(a) \ge 0$ | Underflow / Negative account balance |
| **INV-002** | Conservation | $\sum \text{Balances}_{\text{post}} = \sum \text{Balances}_{\text{pre}}$ | Phantom currency created via race conditions |
| **INV-003** | Concurrency | $\text{Exec}(T_1 \parallel T_2) \equiv \text{Sequential}(T_1, T_2)$ | Non-deterministic state divergence |

---

## 🛠️ CI/CD Integration

To gate pull requests automatically, add this workflow file to `.github/workflows/shipguard.yml`:

```yaml
name: SHIPGUARD Invariant Gate
on: [pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install Formal Verification Tools
        run: |
          pip install -r backend/requirements.txt
      - name: Run Adversarial Gate
        run: |
          python backend/main.py --strict

```

---

## ⚖️ License

Distributed under the **Apache 2.0 License**. See `LICENSE` for details.

```

```
