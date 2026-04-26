"use client";

import { useState } from "react";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import type { FontRole } from "@/lib/fonts";

export const CONTROLS_MIN = 220;
export const CONTROLS_MAX = 360;
export const CONTROLS_DEFAULT = 260;

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
  subheading: { fontSize: 20, lineHeight: 1, letterSpacing: 0 },
  body:       { fontSize: 14, lineHeight: 1, letterSpacing: 0 },
};

const ROLES: FontRole[] = ["heading", "subheading", "body"];

type Props = {
  values: Adjustments;
  onChange: (next: Adjustments) => void;
};

export default function ControlsPanel({ values, onChange, open, onToggle, width, onWidthChange }: Props & { open: boolean, onToggle: () => void, width: number, onWidthChange: (w: number) => void }) {
  const setRole = (role: FontRole, next: RoleAdjustment) =>
    onChange({ ...values, [role]: next });

  const [resizing, setResizing] = useState(false);

  const isDefault = ROLES.every((r) => {
    const v = values[r];
    const d = DEFAULT_ADJUSTMENTS[r];
    return v.fontSize === d.fontSize && v.lineHeight === d.lineHeight && v.letterSpacing === d.letterSpacing;
  });

  const railWidth = 56;

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = width;
    setResizing(true);
    const onMove = (ev: MouseEvent) => {
      const next = Math.max(CONTROLS_MIN, Math.min(CONTROLS_MAX, startW - (ev.clientX - startX)));
      onWidthChange(next);
    };
    const onUp = () => {
      setResizing(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <aside
      className={`relative hidden flex-shrink-0 lg:flex flex-col overflow-hidden border-l ${resizing ? "" : "transition-[width] duration-300 cubic-bezier(0.23, 1, 0.32, 1)"}`}
      style={{
        width: open ? width : railWidth,
        color: "var(--text)",
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      {open && (
        <div
          onMouseDown={startResize}
          role="separator"
          aria-label="Resize controls"
          aria-orientation="vertical"
          className="absolute left-0 top-0 z-10 h-full w-1.5 cursor-ew-resize select-none transition-colors hover:bg-[color:var(--accent)]"
          style={{ background: resizing ? "var(--accent)" : "transparent" }}
        />
      )}
      <div className="flex h-full w-full flex-col">
        {/* Header - mirrored from Sidebar */}
        <header className={`flex items-center h-12 px-4 border-b border-transparent ${open ? "justify-between" : "justify-center"}`}>
          <button
            onClick={onToggle}
            aria-label={open ? "Collapse controls" : "Expand controls"}
            className="rounded-full p-2 transition-all duration-300 hover:bg-[color:var(--bg)] hover:scale-110 active:scale-95"
            style={{ color: "var(--text-muted)" }}
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
          {open && (
            <span className="text-[13px] font-bold uppercase tracking-[0.15em] text-[color:var(--text)] mr-1">
              Adjust
            </span>
          )}
        </header>

        {/* Action Area (only when open) */}
        <div className={`flex flex-col px-5 pb-6 pt-2 transition-all duration-200 ${open ? "opacity-100" : "opacity-0 pointer-events-none h-0 overflow-hidden"}`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => onChange(DEFAULT_ADJUSTMENTS)}
              disabled={isDefault}
              aria-label="Reset adjustments"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30"
              style={{ 
                color: "var(--text)", 
                background: "color-mix(in oklch, var(--surface-muted) 70%, black)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
              }}
            >
              <RotateCcw className="h-3.5 w-3.5 transition-transform group-hover:-rotate-180 duration-500" />
              Reset
            </button>
          </div>
        </div>

        {/* Sliders Area */}
        <div className={`flex flex-col gap-8 px-5 pb-10 transition-all duration-200 ${open ? "opacity-100 overflow-y-auto" : "opacity-0 pointer-events-none h-0 overflow-hidden"}`}>
          {ROLES.map((role) => {
            const cfg = ROLE_CONFIG[role];
            const adj = values[role];
            return (
              <RoleGroup
                key={role}
                label={cfg.label}
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
  adj,
  sizeMin,
  sizeMax,
  sizeStep,
  onChange,
}: {
  label: string;
  adj: RoleAdjustment;
  sizeMin: number;
  sizeMax: number;
  sizeStep: number;
  onChange: (next: RoleAdjustment) => void;
}) {
  return (
    <div className="group py-2 flex flex-col gap-5">
      <div className="flex items-center justify-between border-b pb-1" style={{ borderColor: "color-mix(in oklch, var(--border) 40%, transparent)" }}>
        <span className="text-[12px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--text)" }}>
          {label}
        </span>
      </div>

      <div className="flex flex-col gap-5">
        <SliderRow
          label="Font size"
          value={adj.fontSize}
          min={sizeMin}
          max={sizeMax}
          step={sizeStep}
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
  format,
  parse,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
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
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium opacity-60" style={{ color: "var(--text)" }}>
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
              className="w-12 rounded border px-1 py-0.5 text-center font-mono text-[11px] outline-none"
              style={{
                background: "var(--bg)",
                borderColor: "var(--accent)",
                color: "var(--text)",
              }}
            />
          ) : (
            <button
              onClick={startEdit}
              className="rounded px-1.5 py-0.5 font-mono text-[11px] tabular-nums transition-colors hover:bg-[color:var(--bg)]"
              style={{ color: "var(--text)" }}
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
