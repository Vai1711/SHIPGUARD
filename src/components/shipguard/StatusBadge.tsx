import { cn } from "@/lib/utils";
import type { InvariantStatus } from "./types";
import { ShieldCheck, ShieldAlert, ShieldX, ShieldOff } from "lucide-react";

const statusConfig: Record<
  InvariantStatus,
  { label: string; className: string; icon: typeof ShieldCheck; glowClass: string }
> = {
  standby: {
    label: "STANDBY",
    className: "bg-slate-100 text-slate-500 border-slate-200",
    icon: ShieldOff,
    glowClass: "",
  },
  evaluating: {
    label: "EVALUATING",
    className: "bg-amber-50 text-amber-700 border-amber-300",
    icon: ShieldAlert,
    glowClass: "animate-pulse-glow-amber",
  },
  falsified: {
    label: "FALSIFIED",
    className: "bg-red-50 text-red-600 border-red-300",
    icon: ShieldX,
    glowClass: "animate-pulse-glow-red",
  },
  verified: {
    label: "VERIFIED",
    className: "bg-emerald-50 text-emerald-600 border-emerald-300",
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
