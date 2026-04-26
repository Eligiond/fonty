"use client";

import { useState } from "react";
import { RotateCcw, Eye, EyeOff, SlidersHorizontal } from "lucide-react";
import type { FontRole } from "@/lib/fonts";

export type RoleAdjustment = {
  fontSize: number;      // px value
  lineHeight: number;    // multiplier
  letterSpacing: number; // em value
};

export type Adjustments = Record<FontRole, RoleAdjustment>;

const ROLE_CONFIG: Record<FontRole, {
  label: string;
  sizeMin: number; sizeMax: number; sizeStep: number;
}> = {
  heading:    { label: "H1 · Heading",    sizeMin: 16, sizeMax: 96, sizeStep: 2 },
  subheading: { label: "H3 · Subheading", sizeMin: 12, sizeMax: 40, sizeStep: 1 },
  body:       { label: "P · Body",        sizeMin: 10, sizeMax: 22, sizeStep: 1 },
};

export const DEFAULT_ROLE: RoleAdjustment = { fontSize: 1, lineHeight: 1, letterSpacing: 0 };

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  heading:    { fontSize: 52, lineHeight: 1, letterSpacing: 0 },
  subheading: { fontSize: 22, lineHeight: 1, letterSpacing: 0 },
  body:       { fontSize: 14, lineHeight: 1, letterSpacing: 0 },
};

const ROLES: FontRole[] = ["heading", "subheading", "body"];

type Props = {
  values: Adjustments;
  onChange: (next: Adjustments) => void;
};

export default function ControlsPanel({ values, onChange, open, onToggle }: Props & { open: boolean, onToggle: () => void }) {
  const [pinnedRoles, setPinnedRoles] = useState<Record<FontRole, boolean>>({
    heading: false,
    subheading: false,
    body: false,
  });

  const setRole = (role: FontRole, next: RoleAdjustment) =>
    onChange({ ...values, [role]: next });

  const isDefault = ROLES.every((r) => {
    const v = values[r];
    const d = DEFAULT_ADJUSTMENTS[r];
    return v.fontSize === d.fontSize && v.lineHeight === d.lineHeight && v.letterSpacing === d.letterSpacing;
  });

  const togglePin = (role: FontRole) =>
    setPinnedRoles((p) => ({ ...p, [role]: !p[role] }));

  return (
    <aside
      className="hidden flex-shrink-0 lg:flex flex-col overflow-hidden border-l transition-[width] duration-300 cubic-bezier(0.23, 1, 0.32, 1)"
      style={{ 
        width: open ? 220 : 48,
        color: "var(--text)",
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      <div className="flex h-full w-[220px] flex-col">
        <header className={`flex items-center pt-4 pb-3 px-3 mb-2 ${open ? "justify-between" : "justify-center"}`}>
          {open && <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted opacity-40">Adjust</span>}
          <button
            onClick={onToggle}
            aria-label={open ? "Collapse controls" : "Expand controls"}
            className="rounded-full p-1.5 transition-all duration-300 hover:bg-[color:var(--bg)]"
            style={{ color: "var(--text-muted)" }}
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </header>

        <div className={`flex flex-col px-5 pb-4 transition-all duration-200 ${open ? "opacity-100" : "opacity-0 pointer-events-none h-0 overflow-hidden"}`}>
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => onChange(DEFAULT_ADJUSTMENTS)}
              disabled={isDefault}
              aria-label="Reset adjustments"
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[10px] uppercase tracking-widest transition-all hover:brightness-90 disabled:opacity-30"
              style={{ 
                color: "var(--text-muted)", 
                background: "color-mix(in oklch, var(--surface-muted) 85%, black)" 
              }}
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>
        </div>

        <div className={`flex flex-col gap-2 px-5 pb-10 transition-all duration-200 ${open ? "opacity-100 overflow-y-auto" : "opacity-0 pointer-events-none h-0 overflow-hidden"}`}>
          {ROLES.map((role) => {
            const cfg = ROLE_CONFIG[role];
            const adj = values[role];
            const pinned = pinnedRoles[role];
            return (
              <RoleGroup
                key={role}
                label={cfg.label}
                pinned={pinned}
                onTogglePin={() => togglePin(role)}
                adj={adj}
                sizeMin={cfg.sizeMin}
                sizeMax={cfg.sizeMax}
                sizeStep={cfg.sizeStep}
                onChange={(next) => setRole(role, next)}
              />
            );
          })}
        </div>
      </div>
    </aside>
  );
}

function RoleGroup({
  label,
  pinned,
  onTogglePin,
  adj,
  sizeMin,
  sizeMax,
  sizeStep,
  onChange,
}: {
  label: string;
  pinned: boolean;
  onTogglePin: () => void;
  adj: RoleAdjustment;
  sizeMin: number;
  sizeMax: number;
  sizeStep: number;
  onChange: (next: RoleAdjustment) => void;
}) {
  return (
    <div
      className="group py-2 transition-all duration-200"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className={`text-[10px] font-semibold uppercase tracking-[0.14em] transition-opacity duration-200 ${pinned ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`} style={{ color: "var(--text-muted)" }}>
          {label}
        </span>
        <button
          onClick={onTogglePin}
          aria-label={pinned ? "Hide values" : "Show values"}
          className="rounded p-0.5 transition-all duration-200 hover:scale-110"
          style={{ color: pinned ? "var(--text)" : "var(--text-muted)", opacity: pinned ? 1 : 0.4 }}
        >
          {pinned ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <SliderRow
          label="Font size"
          value={adj.fontSize}
          min={sizeMin}
          max={sizeMax}
          step={sizeStep}
          pinned={pinned}
          format={(v) => `${Math.round(v)}px`}
          parse={(s) => Math.max(sizeMin, Math.min(sizeMax, parseInt(s) || sizeMin))}
          onChange={(v) => onChange({ ...adj, fontSize: v })}
        />
        <SliderRow
          label="Line spacing"
          value={adj.lineHeight}
          min={0.85}
          max={1.85}
          step={0.01}
          pinned={pinned}
          format={(v) => v.toFixed(2)}
          parse={(s) => Math.max(0.85, Math.min(1.85, parseFloat(s) || 1))}
          onChange={(v) => onChange({ ...adj, lineHeight: v })}
        />
        <SliderRow
          label="Letter spacing"
          value={adj.letterSpacing}
          min={-0.04}
          max={0.1}
          step={0.005}
          pinned={pinned}
          format={(v) => `${v >= 0 ? "+" : ""}${(v * 1000).toFixed(0)}`}
          parse={(s) => Math.max(-0.04, Math.min(0.1, (parseFloat(s) || 0) / 1000))}
          onChange={(v) => onChange({ ...adj, letterSpacing: v })}
        />
      </div>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  pinned,
  format,
  parse,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  pinned: boolean;
  format: (v: number) => string;
  parse: (s: string) => number;
  onChange: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const startEdit = () => {
    setDraft(format(value));
    setEditing(true);
  };

  const commit = () => {
    const next = parse(draft);
    onChange(next);
    setEditing(false);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className={`flex items-center justify-between transition-all duration-300 ${pinned ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"}`}>
        <span className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
          {label}
        </span>
        <div>
          {editing ? (
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); commit(); }
                if (e.key === "Escape") setEditing(false);
              }}
              className="w-12 rounded border px-1 py-0.5 text-center font-mono text-[10px] outline-none"
              style={{
                background: "var(--bg)",
                borderColor: "var(--accent)",
                color: "var(--text)",
              }}
            />
          ) : (
            <button
              onClick={startEdit}
              className="rounded px-1 py-0.5 font-mono text-[10px] tabular-nums transition-colors hover:bg-[color:var(--bg)]"
              style={{ color: "var(--text-muted)" }}
            >
              {format(value)}
            </button>
          )}
        </div>
      </div>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="fonty-range"
      />
    </div>
  );
}
