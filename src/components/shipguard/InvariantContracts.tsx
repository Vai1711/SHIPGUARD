import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Invariant } from "./types";
import { StatusBadge } from "./StatusBadge";
import { ScrollText, Pencil, Check, X } from "lucide-react";

/**
 * A single contract card. When `onSave` is provided the card is inline-
 * editable: the pencil swaps the label/description for compact inputs.
 */
function ContractCard({
  inv,
  index,
  onSave,
}: {
  inv: Invariant;
  index: number;
  onSave?: (updated: Invariant) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(inv.label);
  const [description, setDescription] = useState(inv.description);
  const labelInputRef = useRef<HTMLInputElement>(null);

  // Re-sync the draft fields whenever the authoritative values change
  // (e.g. after Save or after derived contracts are re-armed).
  useEffect(() => {
    if (!editing) {
      setLabel(inv.label);
      setDescription(inv.description);
    }
  }, [editing, inv.label, inv.description]);

  // Focus the label input as soon as editing starts.
  useEffect(() => {
    if (editing) labelInputRef.current?.focus();
  }, [editing]);

  const startEdit = () => {
    setLabel(inv.label);
    setDescription(inv.description);
    setEditing(true);
  };

  const cancelEdit = () => {
    setLabel(inv.label);
    setDescription(inv.description);
    setEditing(false);
  };

  const saveEdit = () => {
    const nextLabel = label.trim();
    const nextDescription = description.trim();
    if (!nextLabel || !nextDescription) return;
    onSave?.({
      ...inv,
      label: nextLabel,
      description: nextDescription,
    });
    setEditing(false);
  };

  const locked = inv.status === "falsified" || inv.status === "verified";

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.15, duration: 0.3 }}
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
        <div className="flex items-center gap-1.5">
          {onSave && !editing && (
            <button
              onClick={startEdit}
              disabled={locked}
              title={
                locked
                  ? "Locked — the gate has already passed verdict on this contract"
                  : "Edit this invariant contract"
              }
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-md transition-all duration-200",
                locked
                  ? "text-zinc-700 cursor-not-allowed"
                  : "text-zinc-600 hover:text-cyan-300 hover:bg-white/[0.06] cursor-pointer"
              )}
            >
              <Pencil className="h-3 w-3" />
            </button>
          )}
          <StatusBadge status={inv.status} />
        </div>
      </div>

      {editing ? (
        <div className="flex flex-col gap-1.5">
          <input
            ref={labelInputRef}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit();
              if (e.key === "Escape") cancelEdit();
            }}
            placeholder="Invariant label"
            className="w-full rounded-md border border-cyan-500/30 bg-cyan-500/[0.06] px-2 py-1.5 text-xs font-semibold text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-cyan-400/60"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveEdit();
              if (e.key === "Escape") cancelEdit();
            }}
            rows={2}
            placeholder="Formal description (e.g. ∀ call to transfer(): assert balance >= 0)"
            className="w-full resize-none rounded-md border border-white/[0.12] bg-white/[0.04] px-2 py-1.5 font-mono text-[10px] leading-4 text-zinc-300 outline-none placeholder:text-zinc-600 focus:border-cyan-400/50"
          />
          <div className="flex items-center gap-1.5">
            <button
              onClick={saveEdit}
              disabled={!label.trim() || !description.trim()}
              className="flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-300 transition-all hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Check className="h-3 w-3" />
              Save
            </button>
            <button
              onClick={cancelEdit}
              className="flex items-center gap-1 rounded-md border border-white/[0.1] bg-white/[0.04] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-zinc-400 transition-all hover:bg-white/[0.08] cursor-pointer"
            >
              <X className="h-3 w-3" />
              Cancel
            </button>
            <span className="ml-auto text-[9px] text-zinc-600 font-mono">
              ⌘↵ save · esc cancel
            </span>
          </div>
        </div>
      ) : (
        <>
          <p className="text-xs font-semibold text-zinc-200 mb-1">{inv.label}</p>
          <p className="font-mono text-[10px] text-zinc-500 leading-4">
            {inv.description}
          </p>
        </>
      )}
    </motion.div>
  );
}

export function InvariantContracts({
  invariants,
  compact = false,
  onUpdateInvariant,
}: {
  invariants: Invariant[];
  compact?: boolean;
  onUpdateInvariant?: (updated: Invariant) => void;
}) {
  if (compact) {
    return (
      <div className="glass rounded-xl p-3">
        <div className="flex items-center gap-2 mb-2">
          <ScrollText className="h-3.5 w-3.5 text-cyan-400" />
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Armed Invariant Contracts
          </h3>
          {onUpdateInvariant && (
            <span className="ml-auto text-[9px] text-zinc-600 font-mono">
              click a chip to edit
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {invariants.map((inv, i) => (
            <ContractChip
              key={inv.id}
              inv={inv}
              index={i}
              onSave={onUpdateInvariant}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-1">
        Formal Invariant Contracts
      </h3>
      {invariants.map((inv, i) => (
        <ContractCard
          key={inv.id}
          inv={inv}
          index={i}
          onSave={onUpdateInvariant}
        />
      ))}
    </div>
  );
}

/** Clickable compact chip that expands into an inline edit popover. */
function ContractChip({
  inv,
  index,
  onSave,
}: {
  inv: Invariant;
  index: number;
  onSave?: (updated: Invariant) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(inv.label);
  const [description, setDescription] = useState(inv.description);

  useEffect(() => {
    if (!editing) {
      setLabel(inv.label);
      setDescription(inv.description);
    }
  }, [editing, inv.label, inv.description]);

  const locked = inv.status === "falsified" || inv.status === "verified";

  const saveEdit = () => {
    const nextLabel = label.trim();
    const nextDescription = description.trim();
    if (!nextLabel || !nextDescription) return;
    onSave?.({ ...inv, label: nextLabel, description: nextDescription });
    setEditing(false);
  };

  const cancelEdit = () => {
    setLabel(inv.label);
    setDescription(inv.description);
    setEditing(false);
  };

  if (editing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full rounded-lg border border-cyan-500/30 bg-cyan-500/[0.04] p-2.5"
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-[10px] font-bold text-cyan-300">
            {inv.id} · {inv.type}
          </span>
          <span className="text-[9px] text-zinc-600 font-mono">
            ⌘↵ save · esc cancel
          </span>
        </div>
        <input
          autoFocus
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
              // Move focus behavior is not needed; Enter on label just tabs.
              (e.target as HTMLInputElement).blur();
            }
            if (e.key === "Escape") cancelEdit();
          }}
          placeholder="Invariant label"
          className="w-full mb-1.5 rounded-md border border-cyan-500/30 bg-cyan-500/[0.06] px-2 py-1.5 text-xs font-semibold text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-cyan-400/60"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveEdit();
            if (e.key === "Escape") cancelEdit();
          }}
          rows={2}
          placeholder="Formal description"
          className="w-full resize-none rounded-md border border-white/[0.12] bg-white/[0.04] px-2 py-1.5 font-mono text-[10px] leading-4 text-zinc-300 outline-none placeholder:text-zinc-600 focus:border-cyan-400/50"
        />
        <div className="flex items-center gap-1.5 mt-1.5">
          <button
            onClick={saveEdit}
            disabled={!label.trim() || !description.trim()}
            className="flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-300 transition-all hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Check className="h-3 w-3" />
            Save
          </button>
          <button
            onClick={cancelEdit}
            className="flex items-center gap-1 rounded-md border border-white/[0.1] bg-white/[0.04] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-zinc-400 transition-all hover:bg-white/[0.08] cursor-pointer"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08 }}
      onClick={() => onSave && !locked && setEditing(true)}
      disabled={locked || !onSave}
      title={
        locked
          ? "Locked — the gate has already passed verdict on this contract"
          : "Click to edit this invariant contract"
      }
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold transition-all duration-500",
        inv.status === "falsified" && "border-red-500/40 bg-red-500/10 text-red-300",
        inv.status === "verified" && "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
        inv.status === "evaluating" && "border-amber-500/40 bg-amber-500/10 text-amber-300",
        inv.status === "standby" && "border-white/[0.08] bg-white/[0.04] text-zinc-400",
        onSave && !locked && "hover:border-cyan-500/40 hover:text-cyan-300 cursor-pointer",
        (locked || !onSave) && "cursor-default"
      )}
    >
      {onSave && !locked && <Pencil className="h-2.5 w-2.5 opacity-60" />}
      {inv.id} · {inv.type}
    </motion.button>
  );
}
