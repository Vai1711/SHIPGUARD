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
