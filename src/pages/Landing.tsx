import { motion } from "framer-motion";
import { Shield, ArrowRight, Zap, Lock, Bug, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

const features = [
  {
    icon: Lock,
    title: "Formal Contract Extraction",
    desc: "Translates plain-English specs into parameterizable mathematical invariants — no hand-waving, no vibes.",
  },
  {
    icon: Bug,
    title: "Adversarial Synthesis",
    desc: "Generates deterministic property-based tests engineered to falsify your invariants: boundary, replay, and TOCTOU concurrency attacks.",
  },
  {
    icon: Zap,
    title: "Sandbox Execution",
    desc: "Runs tests in isolated subprocess sandshells. Zero LLM interpretation — only runtime exit codes and assertion traces.",
  },
  {
    icon: Cpu,
    title: "Closed-Loop Repair",
    desc: "Feeds exact failures back to the repair agent with immutable spec boundaries. Patch, re-verify, done.",
  },
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
      <nav className="glass-strong sticky top-0 z-50 border-b border-white/40 px-6 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-cyan-600" />
            <span className="font-mono text-sm font-bold tracking-tight text-slate-800">
              SHIPGUARD
              <span className="text-slate-400 font-normal ml-1">//</span>
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => navigate("/auth")}
            className="gap-1.5 text-[11px] font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-md shadow-cyan-200"
          >
            Launch Dashboard
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 border border-cyan-200 px-4 py-1.5 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700">
                Adversarial Verification Gate for AI Code
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-6">
              Stop LLMs from grading their{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-violet-600">
                own homework
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed mb-8">
              SHIPGUARD runs adversarial invariant verification on AI-generated code.
              It finds race conditions, boundary violations, and state corruptions
              that LLM code reviewers miss — then autonomously patches and re-verifies.
            </p>

            <div className="flex items-center justify-center gap-3">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="gap-2 font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-200/50 px-8"
              >
                Open Command Center
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 font-medium border-slate-200 text-slate-600"
              >
                View on GitHub
              </Button>
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
                  className="glass rounded-xl p-4 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 border border-cyan-100">
                      <Icon className="h-4 w-4 text-cyan-600" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1">{f.title}</h3>
                  <p className="text-[11px] text-slate-500 leading-5">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-strong border-t border-white/40 px-6 py-4 mt-auto">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-mono">
            SHIPGUARD v1.0 — CEGIS-based adversarial code verification
          </span>
          <span className="text-[10px] text-slate-400">
            Built for the AI Developer Quality Track
          </span>
        </div>
      </footer>
    </motion.div>
  );
}
