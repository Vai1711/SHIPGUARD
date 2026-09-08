import { motion } from "framer-motion";
import { Shield, ArrowRight, Zap, Lock, Bug, Cpu, Sparkles, CheckCircle2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";

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

  // The landing page is always shown, even for signed-in users — it's the
  // starting info page. Signed-in users can jump straight to the dashboard
  // via the CTA below.

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
            onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
            className="gap-1.5 text-[11px] font-semibold bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-400/30"
          >
            {isAuthenticated ? "Open Your Dashboard" : "Sign in"}
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
                onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
                className="gap-2 font-semibold bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-lg shadow-cyan-500/25 px-8 transition-all hover:shadow-xl hover:shadow-cyan-400/30"
              >
                {isAuthenticated ? "Open Your Dashboard" : "Sign in to Get Started"}
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
              onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
              className="gap-2 font-semibold bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-lg shadow-cyan-500/25 px-8"
            >
              {isAuthenticated ? "Open Your Dashboard" : "Get Started"}
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
