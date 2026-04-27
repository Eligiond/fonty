"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ReloadIcon,
  Settings01Icon,
  PencilEdit01Icon,
  Delete02Icon,
  GithubIcon,
  Linkedin01Icon,
  MoreHorizontalIcon,
  Tick02Icon,
} from "@hugeicons/react";
import type { FontPairing, FontRole } from "@/lib/fonts";
import { Tooltip } from "./Tooltip";

export type PanelTab = "saved" | "adjust";

export type RoleAdjustment = {
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
};

export type Adjustments = Record<FontRole, RoleAdjustment>;

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  heading:    { fontSize: 48, lineHeight: 1, letterSpacing: 0 },
  subheading: { fontSize: 26, lineHeight: 1, letterSpacing: 0 },
  body:       { fontSize: 16, lineHeight: 1, letterSpacing: 0 },
};

export type SavedItem = {
  type: "item";
  id: string;
  name: string;
  snapshot: FontPairing;
  timestamp: number;
  color?: string | null;
};

// Migration-only legacy types
export type SavedFolder = {
  type: "folder";
  id: string;
  name: string;
  color: string | null;
  items: SavedNode[];
  isOpen?: boolean;
};
export type SavedNode = SavedItem | SavedFolder;

export const PANEL_MIN = 240;
export const PANEL_MAX = 420;
export const PANEL_DEFAULT = 300;

const RAIL_WIDTH = 64;

const ROLE_CONFIG: Record<FontRole, {
  label: string;
  sizeMin: number; sizeMax: number; sizeStep: number;
}> = {
  heading:    { label: "H1 · Heading",    sizeMin: 16, sizeMax: 96, sizeStep: 2 },
  subheading: { label: "H3 · Subheading", sizeMin: 12, sizeMax: 40, sizeStep: 1 },
  body:       { label: "P · Body",        sizeMin: 10, sizeMax: 22, sizeStep: 1 },
};

const ROLES: FontRole[] = ["heading", "subheading", "body"];

const PASTEL_COLORS: Array<{ name: string; value: string | null }> = [
  { name: "None",   value: null },
  { name: "Red",    value: "#fecaca" },
  { name: "Orange", value: "#fed7aa" },
  { name: "Yellow", value: "#fef08a" },
  { name: "Green",  value: "#bbf7d0" },
  { name: "Blue",   value: "#bfdbfe" },
  { name: "Purple", value: "#e9d5ff" },
  { name: "Pink",   value: "#fbcfe8" },
];

const RAIL_BTN_CLASS =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 ease-out hover:bg-[color:var(--bg)]";

type Props = {
  open: boolean;
  onToggle: () => void;
  width: number;
  onWidthChange: (w: number) => void;
  tab: PanelTab;
  onTabChange: (t: PanelTab) => void;

  // Saved tab
  saved: SavedItem[];
  activeId: string | null;
  onLoad: (item: SavedItem) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onSetColor: (id: string, color: string | null) => void;

  // Adjust tab
  values: Adjustments;
  onChange: (next: Adjustments) => void;

  // Footer
  onOpenSettings: () => void;
};

export default function SidePanel({
  open, onToggle, width, onWidthChange,
  tab, onTabChange,
  saved, activeId, onLoad, onRename, onDelete, onSetColor,
  values, onChange,
  onOpenSettings,
}: Props) {
  const [resizing, setResizing] = useState(false);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = width;
    setResizing(true);
    const onMove = (ev: MouseEvent) => {
      const next = Math.max(PANEL_MIN, Math.min(PANEL_MAX, startW - (ev.clientX - startX)));
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
      className={`hidden flex-shrink-0 lg:flex flex-col overflow-hidden border-l ${resizing ? "" : "transition-[width] duration-300 cubic-bezier(0.23, 1, 0.32, 1)"}`}
      style={{
        width: open ? width : RAIL_WIDTH,
        color: "var(--text)",
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      <div className="relative flex h-full w-full flex-col">
        {open && (
          <div
            onMouseDown={startResize}
            role="separator"
            aria-label="Resize panel"
            aria-orientation="vertical"
            className="absolute left-0 top-0 z-10 h-full w-1.5 cursor-ew-resize select-none transition-colors hover:bg-[color:var(--accent)]"
            style={{ background: resizing ? "var(--accent)" : "transparent" }}
          />
        )}

        {/* Header: Toggle + Tabs */}
        <div className={`flex items-center h-16 px-3 gap-3 ${!open ? "justify-center" : ""}`}>
          <Tooltip
            label={open ? "Collapse panel" : "Expand panel"}
            shortcut="."
            direction={open ? "left" : "right"}
          >
            <button
              onClick={onToggle}
              aria-label={open ? "Collapse panel" : "Expand panel"}
              aria-expanded={open}
              className={`group ${RAIL_BTN_CLASS}`}
              style={{ color: "var(--text-muted)" }}
            >
              <div className={`relative flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${open ? "group-hover:translate-x-0.5" : "group-hover:-translate-x-0.5"}`}>
                {open ? <ArrowRight01Icon size={16} /> : <ArrowLeft01Icon size={16} />}
                <div className={`absolute opacity-0 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                  open 
                    ? "-left-1.5 group-hover:opacity-40 group-hover:-left-1" 
                    : "-right-1.5 group-hover:opacity-40 group-hover:-right-1"
                }`}>
                  {open ? <ArrowRight01Icon size={12} /> : <ArrowLeft01Icon size={12} />}
                </div>
              </div>
            </button>
          </Tooltip>
          
          {open && (
            <div className="flex-1 min-w-0">
              <PanelTabs tab={tab} onChange={onTabChange} />
            </div>
          )}
        </div>

        {/* Content */}
        {open && (
          <div className="flex-1 min-h-0 overflow-hidden">
            {tab === "saved" ? (
              <SavedListView
                saved={saved}
                activeId={activeId}
                onLoad={onLoad}
                onRename={onRename}
                onDelete={onDelete}
                onSetColor={onSetColor}
              />
            ) : (
              <AdjustView values={values} onChange={onChange} />
            )}
          </div>
        )}

        {/* Footer */}
        <Footer open={open} onOpenSettings={onOpenSettings} />
      </div>
    </aside>
  );
}

/* ────────────────────────────────────────────────────────────
   Panel Tabs (Saved | Adjust)
   ──────────────────────────────────────────────────────────── */

function PanelTabs({ tab, onChange }: { tab: PanelTab; onChange: (t: PanelTab) => void }) {
  return (
    <div
      role="tablist"
      aria-label="Panel sections"
      className="inline-flex w-full items-center gap-0.5 rounded-full p-0.5"
      style={{
        background: "var(--surface-muted)",
        boxShadow: "inset 0 0 0 1px color-mix(in oklch, var(--border) 60%, transparent)",
      }}
    >
      <TabPill active={tab === "saved"} onClick={() => onChange("saved")} label="Saved" />
      <TabPill active={tab === "adjust"} onClick={() => onChange("adjust")} label="Adjust" />
    </div>
  );
}

function TabPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className="group relative flex-1 inline-flex items-center justify-center h-7 rounded-full px-3 text-[12px] font-semibold tracking-tight transition-[color,background,box-shadow,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97]"
      style={{
        background: active ? "var(--surface)" : "transparent",
        color: active ? "var(--text)" : "var(--text-muted)",
        boxShadow: active
          ? "0 1px 2px rgba(0,0,0,0.06), 0 0 0 1px var(--border)"
          : "none",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.color = "var(--text)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.color = "var(--text-muted)";
      }}
    >
      {label}
    </button>
  );
}

/* ────────────────────────────────────────────────────────────
   Saved tab
   ──────────────────────────────────────────────────────────── */

function SavedListView({
  saved,
  activeId,
  onLoad,
  onRename,
  onDelete,
  onSetColor,
}: {
  saved: SavedItem[];
  activeId: string | null;
  onLoad: (item: SavedItem) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onSetColor: (id: string, color: string | null) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pt-2 pb-2">
        <span
          className="text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color: "var(--text-muted)" }}
        >
          Saved
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {saved.length === 0 ? (
          <p className="px-3 py-6 text-[12px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Hit Save on a pairing you like.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {saved.map((item) => (
              <SavedRow
                key={item.id}
                item={item}
                active={item.id === activeId}
                onLoad={() => onLoad(item)}
                onRename={(name) => onRename(item.id, name)}
                onDelete={() => onDelete(item.id)}
                onSetColor={(color) => onSetColor(item.id, color)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function SavedRow({
  item,
  active,
  onLoad,
  onRename,
  onDelete,
  onSetColor,
}: {
  item: SavedItem;
  active: boolean;
  onLoad: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  onSetColor: (color: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.name);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        (!rowRef.current || !rowRef.current.contains(target)) &&
        (!menuContainerRef.current || !menuContainerRef.current.contains(target))
      ) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const startEdit = () => {
    setDraft(item.name);
    setEditing(true);
    setMenuOpen(false);
  };

  const commit = () => {
    const next = draft.trim();
    if (next && next !== item.name) onRename(next);
    setEditing(false);
  };

  const hasColor = !!item.color;
  const bg = active
    ? (hasColor ? "var(--accent)" : "var(--surface-muted)")
    : (hasColor ? `color-mix(in oklch, ${item.color} 38%, var(--surface))` : "transparent");
  const hoverBg = active
    ? (hasColor ? "var(--accent)" : "var(--surface-muted)")
    : (hasColor ? `color-mix(in oklch, ${item.color} 58%, var(--surface))` : "var(--surface-muted)");
  const textColor = active 
    ? (hasColor ? "var(--accent-text)" : "var(--text)") 
    : "var(--text)";

  return (
    <li>
      <div
        ref={rowRef}
        role="button"
        tabIndex={0}
        onClick={() => { if (editing || menuOpen) return; onLoad(); }}
        className={`group relative flex h-8 items-center gap-3 rounded-lg px-3 text-[13px] transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.985] ${editing ? "" : "cursor-pointer"}`}
        style={{ background: bg, color: textColor }}
        onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = hoverBg; }}
        onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = bg; }}
      >
        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); commit(); }
                if (e.key === "Escape") setEditing(false);
              }}
              className="w-full bg-transparent outline-none"
              style={{ color: textColor }}
            />
          ) : (
            <div className="truncate font-semibold tracking-tight">{item.name}</div>
          )}
        </div>

        {!editing && (
          <div className="flex items-center gap-1">
            {active && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                aria-label="Delete pairing"
                className="flex h-6 w-6 flex-none items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-black/10"
                style={{ color: textColor }}
              >
                <Delete02Icon size={14} />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!menuOpen) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setMenuCoords({ top: rect.bottom + 4, left: rect.right });
                }
                setMenuOpen((v) => !v);
              }}
              aria-label="More actions"
              aria-expanded={menuOpen}
              className={`flex h-6 w-6 flex-none items-center justify-center rounded-lg transition-opacity duration-150 ${menuOpen || active ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"} hover:bg-[color:var(--bg)]`}
              style={{ color: textColor }}
            >
              <MoreHorizontalIcon size={14} />
            </button>
          </div>
        )}
      </div>

      {menuOpen && createPortal(
        <div
          ref={menuContainerRef}
          className="fixed z-[9999]"
          style={{ top: menuCoords.top, left: menuCoords.left, transform: "translateX(-100%)" }}
        >
          <div
            role="menu"
            className="min-w-[160px] rounded-xl border p-1 shadow-lg"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
          >
            <button
              role="menuitem"
              onClick={(e) => { e.stopPropagation(); startEdit(); }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] font-medium transition-colors duration-150 ease-out hover:bg-[color:var(--bg)]"
            >
              <PencilEdit01Icon size={14} className="opacity-60" />
              Rename
            </button>
            <button
              role="menuitem"
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(); }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] font-medium transition-colors duration-150 ease-out hover:bg-[color:var(--bg)]"
            >
              <Delete02Icon size={14} className="opacity-60" />
              Delete
            </button>

            <div className="my-1 border-t" style={{ borderColor: "var(--border)" }} />

            <div className="px-2 pb-1.5 pt-1">
              <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--text-muted)" }}>
                Color
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {PASTEL_COLORS.map((c) => {
                  const selected = (item.color ?? null) === c.value;
                  const isNone = c.value === null;
                  return (
                    <button
                      key={c.name}
                      role="menuitemradio"
                      aria-checked={selected}
                      aria-label={c.name}
                      title={c.name}
                      onClick={(e) => { e.stopPropagation(); onSetColor(c.value); }}
                      className="relative flex h-4 w-4 items-center justify-center rounded-full border transition-transform duration-150 ease-out hover:scale-110 shadow-sm"
                      style={{ background: c.value ?? "transparent", borderColor: c.value ?? "var(--border)" }}
                    >
                      {selected && (
                        <Tick02Icon size={12} style={{ color: isNone ? "var(--text)" : "#444" }} />
                      )}
                      {isNone && !selected && (
                        <span aria-hidden className="absolute h-px w-2.5 rotate-45 rounded-full" style={{ background: "var(--text-muted)" }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </li>
  );
}

/* ────────────────────────────────────────────────────────────
   Adjust tab
   ──────────────────────────────────────────────────────────── */

function AdjustView({ values, onChange }: { values: Adjustments; onChange: (next: Adjustments) => void }) {
  const setRole = (role: FontRole, next: RoleAdjustment) =>
    onChange({ ...values, [role]: next });

  const isDefault = ROLES.every((r) => {
    const v = values[r];
    const d = DEFAULT_ADJUSTMENTS[r];
    return v.fontSize === d.fontSize && v.lineHeight === d.lineHeight && v.letterSpacing === d.letterSpacing;
  });

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex items-center justify-between px-5 pt-2 pb-1">
        <span
          className="text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color: "var(--text-muted)" }}
        >
          Adjust
        </span>
        <Tooltip label="Reset to defaults" direction="left">
          <button
            onClick={() => onChange(DEFAULT_ADJUSTMENTS)}
            disabled={isDefault}
            aria-label="Reset adjustments"
            className="group inline-flex h-7 w-7 items-center justify-center rounded-lg transition-colors duration-150 ease-out hover:bg-[color:var(--bg)] disabled:opacity-30 disabled:hover:bg-transparent"
            style={{ color: "var(--text-muted)" }}
          >
            <ReloadIcon size={14} className="transition-transform duration-500 group-hover:-rotate-180" />
          </button>
        </Tooltip>
      </div>
      <div className="flex flex-col gap-8 px-5 pb-10 pt-4">
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
    <div className="group flex flex-col gap-5 py-2">
      <div
        className="flex items-center justify-between border-b pb-1"
        style={{ borderColor: "color-mix(in oklch, var(--border) 40%, transparent)" }}
      >
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

/* ────────────────────────────────────────────────────────────
   Footer (Settings + social)
   ──────────────────────────────────────────────────────────── */

function Footer({ open, onOpenSettings }: { open: boolean; onOpenSettings: () => void }) {
  return (
    <div
      className={`mt-auto flex flex-col items-center pt-3 pb-4 ${open ? "px-3 border-t" : "px-2"}`}
      style={{ borderColor: "var(--border)" }}
    >
      {open ? (
        <div className="flex w-full items-center gap-1">
          <Tooltip label="Settings" shortcut="i" direction="right" className="flex-1">
            <button
              onClick={onOpenSettings}
              aria-label="Settings"
              className="group flex flex-1 h-8 items-center justify-start gap-1.5 rounded-xl px-3 text-[12px] font-medium transition-colors duration-150 ease-out hover:bg-[color:var(--bg)]"
              style={{ color: "var(--text-muted)" }}
            >
              <Settings01Icon size={18} className="transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:rotate-45" />
              Settings
            </button>
            </Tooltip>
            <div className="flex items-center gap-0.5 flex-shrink-0">
            <SocialLink href="https://www.linkedin.com/in/leonmatos" label="LinkedIn">
              <Linkedin01Icon size={18} />
            </SocialLink>
            <SocialLink href="https://github.com/Eligiond" label="GitHub">
              <GithubIcon size={18} />
            </SocialLink>
            </div>        </div>
      ) : (
        <Tooltip label="Settings" shortcut="i" direction="right">
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className={`group ${RAIL_BTN_CLASS}`}
            style={{ color: "var(--text-muted)" }}
          >
            <Settings01Icon size={18} className="transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:rotate-45" />
          </button>
        </Tooltip>
      )}
    </div>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="rounded-lg p-1.5 transition-colors duration-150 ease-out hover:bg-[color:var(--bg)]"
      style={{ color: "var(--text-muted)" }}
    >
      {children}
    </a>
  );
}
