import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { DemoPhase, Invariant, TargetFile } from "./types";
import { DEFAULT_TARGET_NAME, deriveInvariants, analyzeSource } from "./analysis";
import { SAMPLE_MODULE } from "./samples";
import type { SourceAnalysis } from "./analysis";
import { InvariantContracts } from "./InvariantContracts";
import { Button } from "@/components/ui/button";
import {
  FileText,
  FileCode2,
  Upload,
  CheckCircle2,
  Brain,
  ChevronDown,
  ChevronUp,
  ClipboardPaste,
  Terminal,
  Sparkles,
  AlertTriangle,
  Copy,
  Check,
  RotateCcw,
  Wand2,
} from "lucide-react";

export function SpecColumn({
  phase,
  invariants,
  onExtract,
  onTargetChange,
}: {
  phase: DemoPhase;
  invariants: Invariant[];
  onExtract: () => void;
  onTargetChange?: (file: TargetFile | null) => void;
}) {
  const [sourceMode, setSourceMode] = useState<"preset" | "custom">("preset");
  const [customCode, setCustomCode] = useState<string>(SAMPLE_MODULE);
  const [specExpanded, setSpecExpanded] = useState(true);
  const [targetFile, setTargetFile] = useState<TargetFile | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bobExpanded, setBobExpanded] = useState(false);
  const [bobGenerated, setBobGenerated] = useState(false);
  const [bobTyping, setBobTyping] = useState(false);
  const [bobText, setBobText] = useState("");
  const [bobCopied, setBobCopied] = useState(false);
  const bobAreaRef = useRef<HTMLPreElement>(null);
  const bobTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isExtracting = phase === "extracting";
  const gateLocked = isExtracting || phase !== "idle";
  const showContracts =
    phase === "contracts" ||
    phase === "attacking" ||
    phase === "breached" ||
    phase === "patching" ||
    phase === "verified";

  // Live static analysis of the currently edited custom code (debounced).
  const customAnalysis = useMemo(() => analyzeSource(customCode), [customCode]);

  // Publish the custom source to the gate while the gate has not started —
  // once contracts are armed, editing the source must not silently swap
  // the target or the derived contracts mid-run.
  useEffect(() => {
    if (gateLocked) return;
    if (sourceMode === "custom" && customAnalysis.report) {
      onTargetChange?.({ name: "pasted_target.py", content: customCode });
    }
  }, [gateLocked, sourceMode, customAnalysis.report, customCode, onTargetChange]);

  // Arm the invariants derived from the pasted code when extraction starts.
  const extractFromCustom = () => {
    const report: SourceAnalysis | null = customAnalysis.report;
    if (!report) return;
    onTargetChange?.({ name: "pasted_target.py", content: customCode });
    onExtract();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadError(null);
    try {
      const content = await file.text();
      const next = { name: file.name, content };
      setSourceMode("preset");
      setTargetFile(next);
      onTargetChange?.(next);
    } catch {
      setUploadError("Could not read that file. Try a plain .py source file.");
    }
  };

  const clearTarget = () => {
    setTargetFile(null);
    onTargetChange?.(null);
    setUploadError(null);
  };

  const startBobSynthesis = () => {
    if (bobTyping || bobGenerated) return;
    setBobTyping(true);
    setBobText("");
    setBobGenerated(false);
    const full = SAMPLE_MODULE;
    let i = 0;
    bobTimerRef.current = setInterval(() => {
      i += 1 + Math.floor(Math.random() * 4);
      setBobText(full.slice(0, i));
      if (i >= full.length) {
        if (bobTimerRef.current) clearInterval(bobTimerRef.current);
        bobTimerRef.current = null;
        setBobTyping(false);
        setBobGenerated(true);
      }
    }, 16);
  };

  useEffect(() => {
    return () => {
      if (bobTimerRef.current) clearInterval(bobTimerRef.current);
    };
  }, []);

  const copyBobCode = () => {
    navigator.clipboard.writeText(SAMPLE_MODULE);
    setBobCopied(true);
    setTimeout(() => setBobCopied(false), 2000);
  };

  const resetBob = () => {
    if (bobTimerRef.current) clearInterval(bobTimerRef.current);
    bobTimerRef.current = null;
    setBobTyping(false);
    setBobGenerated(false);
    setBobText("");
  };

  // Keep the typing caret scrolled to the bottom of the synthesized output.
  useEffect(() => {
    if (bobTyping && bobAreaRef.current) {
      bobAreaRef.current.scrollTop = bobAreaRef.current.scrollHeight;
    }
  }, [bobText, bobTyping]);

  const lineCount = targetFile?.content.split("\n").length ?? 0;

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* IBM Bob Code Synthesis */}
      <div className="glass rounded-xl p-4">
        <button
          onClick={() => setBobExpanded((v) => !v)}
          className="flex items-center justify-between w-full text-left mb-1"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              AI Code Synthesis
            </h3>
          </div>
          {bobExpanded ? (
            <ChevronUp className="h-3.5 w-3.5 text-zinc-500" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
          )}
        </button>
        <p className="text-[10px] text-zinc-500 mb-3">
          Have <span className="font-semibold text-violet-400">IBM Bob</span> write the
          service, then let the gate attack it.
        </p>

        <AnimatePresence initial={false}>
          {bobExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {!bobGenerated && !bobTyping && (
                <Button
                  onClick={startBobSynthesis}
                  size="sm"
                  className="w-full gap-1.5 text-[11px] font-semibold bg-violet-500 hover:bg-violet-400 text-white shadow-md shadow-violet-500/20 transition-all"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  Generate Service with IBM Bob
                </Button>
              )}

              {(bobTyping || bobGenerated) && (
                <>
                  <div className="rounded-lg border border-white/[0.08] bg-[#0b0b10] overflow-hidden">
                    <div className="flex items-center gap-2 bg-white/[0.03] border-b border-white/[0.06] px-3 py-1.5">
                      <Terminal className="h-3 w-3 text-violet-400" />
                      <span className="text-[10px] font-mono font-semibold text-zinc-400">
                        bob_generated_service.py
                      </span>
                      {bobTyping && (
                        <span className="ml-auto flex items-center gap-1 text-[9px] font-mono text-violet-300">
                          <motion.span
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            ▍
                          </motion.span>
                          generating…
                        </span>
                      )}
                    </div>
                    <pre
                      ref={bobAreaRef}
                      className="max-h-48 overflow-auto p-2.5 font-mono text-[10px] leading-4 text-zinc-400 whitespace-pre"
                    >
                      {bobText}
                      {bobTyping && <span className="text-violet-300">▍</span>}
                    </pre>
                  </div>

                  <AnimatePresence>
                    {bobGenerated && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-wrap items-center gap-1.5 mt-2.5"
                      >
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-violet-300">
                          <Sparkles className="h-3 w-3" />
                          Generated by IBM Bob (Granite-Code)
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300">
                          <AlertTriangle className="h-3 w-3" />
                          Unsynchronized state detected
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {bobGenerated && (
                    <div className="flex gap-1.5 mt-2.5">
                      <Button
                        onClick={copyBobCode}
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1.5 text-[10px] font-semibold border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
                      >
                        {bobCopied ? (
                          <>
                            <Check className="h-3 w-3" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" /> Copy
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          setCustomCode(SAMPLE_MODULE);
                          setSourceMode("custom");
                        }}
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1.5 text-[10px] font-semibold border-violet-500/30 text-violet-300 hover:bg-violet-500/10"
                      >
                        <FileCode2 className="h-3 w-3" /> Use as target
                      </Button>
                      <Button
                        onClick={resetBob}
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-[10px] font-semibold border-white/10 text-zinc-500 hover:text-white hover:bg-white/5"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
              {/* Source tabs: Preset vs Custom */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                    Target Source
                  </span>
                  <span className="text-[9px] text-zinc-600">
                    {sourceMode === "custom" ? "analyzed client-side" : "SHIPGUARD ingests any .py"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 rounded-lg bg-white/[0.04] border border-white/[0.06] p-1 mb-2">
                  <button
                    onClick={() => setSourceMode("preset")}
                    disabled={gateLocked}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[10px] font-semibold transition-all duration-200 disabled:opacity-40 cursor-pointer",
                      sourceMode === "preset"
                        ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                        : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                    )}
                  >
                    <FileCode2 className="h-3 w-3" />
                    Presets (CampusPay)
                  </button>
                  <button
                    onClick={() => setSourceMode("custom")}
                    disabled={gateLocked}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[10px] font-semibold transition-all duration-200 disabled:opacity-40 cursor-pointer",
                      sourceMode === "custom"
                        ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                        : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                    )}
                  >
                    <ClipboardPaste className="h-3 w-3" />
                    Paste Custom Python
                  </button>
                </div>

                {sourceMode === "preset" && (
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[10px] font-semibold transition-all duration-300",
                        targetFile
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                          : "bg-white/[0.04] border-white/[0.08] text-zinc-400"
                      )}
                    >
                      {targetFile ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          {targetFile.name}
                          <span className="text-emerald-400/60 font-normal">
                            · {lineCount} lines
                          </span>
                        </>
                      ) : (
                        <>
                          <FileCode2 className="h-3 w-3" />
                          {DEFAULT_TARGET_NAME}
                          <span className="text-zinc-600 font-normal">· pre-loaded</span>
                        </>
                      )}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={gateLocked}
                      className="h-6 gap-1 px-2 text-[9px] font-semibold border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-40"
                    >
                      <Upload className="h-3 w-3" />
                      {targetFile ? "Replace" : "Upload .py"}
                    </Button>
                    {targetFile && (
                      <button
                        onClick={clearTarget}
                        disabled={gateLocked}
                        className="text-[9px] text-zinc-600 hover:text-zinc-300 underline underline-offset-2 disabled:opacity-40"
                      >
                        reset
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".py,text/x-python"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>
                )}

                {sourceMode === "custom" && (
                  <div>
                    <div className="rounded-lg border border-white/[0.08] bg-[#0b0b10] overflow-hidden">
                      <div className="flex items-center gap-2 bg-white/[0.03] border-b border-white/[0.06] px-3 py-1.5">
                        <Terminal className="h-3 w-3 text-cyan-400" />
                        <span className="text-[10px] font-mono font-semibold text-zinc-400">
                          pasted_target.py
                        </span>
                        <span className="ml-auto text-[9px] font-mono text-zinc-600">
                          {customAnalysis.report ? customCode.split("\n").length : 0} lines
                        </span>
                      </div>
                      <textarea
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value)}
                        disabled={gateLocked}
                        spellCheck={false}
                        rows={12}
                        className="w-full resize-y bg-transparent p-2.5 font-mono text-[10px] leading-4 text-zinc-300 outline-none placeholder:text-zinc-600"
                        placeholder="Paste any Python service here…"
                      />
                    </div>

                    {/* Live analysis chips */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {customAnalysis.report ? (
                        <>
                          <span className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-mono font-semibold text-cyan-300">
                            {customAnalysis.report.functions.length} functions
                          </span>
                          <span className="rounded-full border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[9px] font-mono font-semibold text-violet-300">
                            {customAnalysis.report.branches} branches
                          </span>
                          <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[9px] font-mono font-semibold text-amber-300">
                            {customAnalysis.report.mutations} state mutations
                          </span>
                          {customAnalysis.report.raceSuspect && (
                            <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[9px] font-mono font-bold text-red-300">
                              TOCTOU suspect · no lock
                            </span>
                          )}
                          {customAnalysis.report.usesLock && (
                            <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-mono font-bold text-emerald-300">
                              synchronized (lock)
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-[9px] font-mono text-zinc-600">
                          Paste Python code to enable extraction…
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {uploadError && (
                  <p className="mt-1 text-[10px] text-red-400">{uploadError}</p>
                )}
                {sourceMode === "preset" && targetFile && (
                  <motion.pre
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2 max-h-28 overflow-auto rounded-lg bg-[#0b0b10] border border-emerald-500/20 p-2.5 font-mono text-[9px] leading-4 text-zinc-500 whitespace-pre-wrap"
                  >
                    {targetFile.content.length > 1200
                      ? `${targetFile.content.slice(0, 1200)}\n… (truncated)`
                      : targetFile.content}
                  </motion.pre>
                )}
              </div>

              {/* Requirements text */}
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
                onClick={sourceMode === "custom" ? extractFromCustom : onExtract}
                disabled={isExtracting || showContracts || (sourceMode === "custom" && !customAnalysis.report)}
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
                    Extract Formal Invariants with IBM Bob
                  </>
                )}
              </Button>
              <p className="mt-2 text-center text-[9px] text-zinc-600">
                Contract extraction powered by{" "}
                <span className="font-semibold text-violet-400">IBM Bob</span>
                {sourceMode === "custom" && (
                  <span> · derived live from your pasted code</span>
                )}
              </p>
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
          >
            <InvariantContracts invariants={invariants} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
