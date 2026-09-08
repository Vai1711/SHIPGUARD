import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TerminalViewProps {
  lines: string[];
  isRunning?: boolean;
  className?: string;
}

export function TerminalView({ lines, isRunning = false, className }: TerminalViewProps) {
  const bodyRef = useRef<HTMLDivElement>(null);

  // Keep the latest output visible as lines stream in (matches a real
  // terminal). A user scroll-up is respected — auto-scroll re-engages
  // when they return to the bottom.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const nearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    if (nearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [lines]);

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
      <div ref={bodyRef} className="p-3 font-mono text-[11px] leading-5 max-h-40 overflow-y-auto">
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
