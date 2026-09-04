"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

/**
 * SHIPGUARD Invariant Gate — Convex Action
 *
 * Bridges the Python backend engine with the React frontend.
 * Runs the full Extract → Attack → Repair → Verify pipeline
 * via a Python subprocess and returns structured JSON results.
 */

function getBackendRoot(): string {
  // In development, backend is at project root /backend
  const projectRoot = process.cwd();
  return path.join(projectRoot, "backend");
}

function ensureBackendPath(): string {
  const backendRoot = getBackendRoot();
  if (!fs.existsSync(path.join(backendRoot, "main.py"))) {
    throw new Error(
      `Backend not found at ${backendRoot}. Ensure backend/ directory exists.`
    );
  }
  return backendRoot;
}

/**
 * Step 1: Extract invariants from Python source via AST parsing.
 */
export const extractInvariants = action({
  args: { source: v.string(), targetName: v.string() },
  handler: async (ctx, args) => {
    const backendRoot = ensureBackendPath();

    // Write source to a temp file for the Python extractor
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "shipguard-"));
    const sourcePath = path.join(tmpDir, "target.py");
    fs.writeFileSync(sourcePath, args.source);

    try {
      const pythonScript = `
import sys, json
sys.path.insert(0, "${backendRoot}")
from contracts.extractor import extract_invariants

with open("${sourcePath}") as f:
    source = f.read()

result = extract_invariants(source)
print(json.dumps(result.to_dict(), default=str))
`;

      const scriptPath = path.join(tmpDir, "extract.py");
      fs.writeFileSync(scriptPath, pythonScript);

      const output = execSync(`python3 "${scriptPath}"`, {
        encoding: "utf-8",
        timeout: 10000,
        cwd: backendRoot,
      });

      return JSON.parse(output.trim());
    } catch (err: any) {
      return {
        invariants: [],
        mutations: [],
        guards: [],
        functions_analyzed: 0,
        error: err.message || "Extraction failed",
      };
    } finally {
      // Cleanup temp files
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {}
    }
  },
});

/**
 * Step 2: Run adversarial attack suite against the target source.
 */
export const runAdversarialSuite = action({
  args: {
    source: v.string(),
    targetName: v.string(),
    extractionResult: v.any(),
  },
  handler: async (ctx, args) => {
    const backendRoot = ensureBackendPath();

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "shipguard-"));
    const sourcePath = path.join(tmpDir, "target.py");
    fs.writeFileSync(sourcePath, args.source);

    try {
      const pythonScript = `
import sys, json
sys.path.insert(0, "${backendRoot}")

from contracts.schemas import ExtractionResult, Invariant, InvariantType, InvariantStatus
from synthesizer.attack_synthesizer import synthesize_and_run

# Reconstruct extraction result from JSON
extraction = ExtractionResult()
extraction.functions_analyzed = ${JSON.stringify(args.extractionResult.functions_analyzed || 0)}
extraction.source_hash = ${JSON.stringify(args.extractionResult.source_hash || "")}

for inv_data in ${JSON.stringify(args.extractionResult.invariants || [])}:
    inv = Invariant(
        id=inv_data["id"],
        type=InvariantType(inv_data["type"]),
        label=inv_data["label"],
        description=inv_data["description"],
        formal_expr=inv_data.get("formal_expr", ""),
        source_line=inv_data.get("source_line"),
        source_function=inv_data.get("source_function"),
    )
    extraction.invariants.append(inv)

with open("${sourcePath}") as f:
    target_source = f.read()

result = synthesize_and_run(extraction, target_source, "${args.targetName}")
print(json.dumps(result.to_dict(), default=str))
`;

      const scriptPath = path.join(tmpDir, "attack.py");
      fs.writeFileSync(scriptPath, pythonScript);

      const output = execSync(`python3 "${scriptPath}"`, {
        encoding: "utf-8",
        timeout: 60000,
        cwd: backendRoot,
      });

      return JSON.parse(output.trim());
    } catch (err: any) {
      return {
        failures: [],
        total_tests: 0,
        passed: 0,
        failed: 0,
        execution_time_ms: 0,
        breached: false,
        error: err.message || "Attack suite failed",
      };
    } finally {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {}
    }
  },
});

/**
 * Step 3: Apply autonomous repair via LibCST AST rewriting.
 */
export const applyRepair = action({
  args: {
    source: v.string(),
    extractionResult: v.any(),
    attackResult: v.any(),
  },
  handler: async (ctx, args) => {
    const backendRoot = ensureBackendPath();

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "shipguard-"));
    const sourcePath = path.join(tmpDir, "target.py");
    fs.writeFileSync(sourcePath, args.source);

    try {
      const pythonScript = `
import sys, json
sys.path.insert(0, "${backendRoot}")

from contracts.schemas import (
    ExtractionResult, Invariant, InvariantType, InvariantStatus,
    AttackResult, TestFailure,
)
from repair.repair_engine import repair_source

# Reconstruct extraction
extraction = ExtractionResult()
extraction.functions_analyzed = ${JSON.stringify(args.extractionResult.functions_analyzed || 0)}
extraction.source_hash = ${JSON.stringify(args.extractionResult.source_hash || "")}
for inv_data in ${JSON.stringify(args.extractionResult.invariants || [])}:
    extraction.invariants.append(
        Invariant(
            id=inv_data["id"],
            type=InvariantType(inv_data["type"]),
            label=inv_data["label"],
            description=inv_data["description"],
            formal_expr=inv_data.get("formal_expr", ""),
        )
    )

# Reconstruct attack result
attack_result = AttackResult(
    total_tests=${JSON.stringify(args.attackResult.total_tests || 0)},
    passed=${JSON.stringify(args.attackResult.passed || 0)},
    failed=${JSON.stringify(args.attackResult.failed || 0)},
    breached=${JSON.stringify(args.attackResult.breached || false)},
    target_name=${JSON.stringify(args.attackResult.target_name || "")},
)
for fail_data in ${JSON.stringify(args.attackResult.failures || [])}:
    attack_result.failures.append(
        TestFailure(
            invariant_id=fail_data["invariant_id"],
            test_name=fail_data["test_name"],
            description=fail_data["description"],
            expected=fail_data["expected"],
            actual=fail_data["actual"],
            traceback=fail_data.get("traceback", ""),
        )
    )

with open("${sourcePath}") as f:
    source = f.read()

result = repair_source(source, extraction, attack_result)
print(json.dumps(result.to_dict(), default=str))
`;

      const scriptPath = path.join(tmpDir, "repair.py");
      fs.writeFileSync(scriptPath, pythonScript);

      const output = execSync(`python3 "${scriptPath}"`, {
        encoding: "utf-8",
        timeout: 30000,
        cwd: backendRoot,
      });

      return JSON.parse(output.trim());
    } catch (err: any) {
      return {
        original_source: args.source,
        patched_source: args.source,
        diff: "",
        patches_applied: 0,
        strategy: "failed",
        error: err.message || "Repair failed",
      };
    } finally {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {}
    }
  },
});
