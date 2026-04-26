"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  LayoutDashboard,
  Search,
  Pencil,
  Trash2,
  Github,
  Linkedin,
  Bookmark,
  Settings as SettingsIcon,
  MoreHorizontal,
  Check,
} from "lucide-react";
import type { FontPairing } from "@/lib/fonts";
import type { ThemeId } from "@/lib/themes";
import { getContrastText } from "@/lib/colors";

export type SavedItem = {
  id: string;
  name: string;
  snapshot: FontPairing;
  color?: string | null;
};

export const SIDEBAR_MIN = 220;
export const SIDEBAR_MAX = 360;
export const SIDEBAR_DEFAULT = 260;

const COLOR_OPTIONS: Array<{ name: string; value: string | null }> = [
  { name: "None", value: null },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Yellow", value: "#eab308" },
  { name: "Green", value: "#22c55e" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
];

function Kbd({ shortcut }: { shortcut: string }) {
  return (
    <span
      className="inline-flex select-none items-center gap-[1px] rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-medium leading-none"
      style={{
        borderColor: "var(--border)",
        background: "var(--bg)",
        color: "var(--text-muted)",
      }}
    >
      <span className="text-[11px]">⌘</span>
      <span>{shortcut}</span>
    </span>
  );
}

function Tooltip({
  shortcut,
  children,
}: {
  shortcut: string;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const wrapperRef = useRef<HTMLSpanElement>(null);

  // Delay portal rendering until after hydration so the React tree matches the SSR output.
  useEffect(() => setMounted(true), []);

  const place = () => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    setCoords({
      top: rect.top + rect.height / 2,
      left: rect.right + 10,
    });
  };

  return (
    <>
      <span
        ref={wrapperRef}
        onMouseEnter={() => {
          place();
          setVisible(true);
        }}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => {
          place();
          setVisible(true);
        }}
        onBlur={() => setVisible(false)}
        className="inline-flex"
      >
        {children}
      </span>
      {mounted &&
        createPortal(
          <div
            role="tooltip"
            aria-hidden={!visible}
            className="pointer-events-none fixed z-[100] flex -translate-y-1/2 items-center transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{
              top: coords.top,
              left: coords.left,
              opacity: visible ? 1 : 0,
              transform: `translate(${visible ? 0 : -4}px, -50%)`,
            }}
          >
            <Kbd shortcut={shortcut} />
          </div>,
          document.body,
        )}
    </>
  );
}

type Props = {
  open: boolean;
  onToggle: () => void;
  saved: SavedItem[];
  activeId: string | null;
  onLoad: (item: SavedItem) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onSetColor: (id: string, color: string | null) => void;
  onNewRoll: () => void;
  onOpenSettings: () => void;
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
  isDark: boolean;
  setIsDark: (v: boolean) => void;
  width: number;
  onWidthChange: (w: number) => void;
  searchInputRef?: React.RefObject<HTMLInputElement>;
};

export default function Sidebar({
  open,
  onToggle,
  saved,
  activeId,
  onLoad,
  onRename,
  onDelete,
  onSetColor,
  onOpenSettings,
  width,
  onWidthChange,
  searchInputRef,
}: Props) {
  const [query, setQuery] = useState("");
  const [resizing, setResizing] = useState(false);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = width;
    setResizing(true);
    const onMove = (ev: MouseEvent) => {
      const next = Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, startW + (ev.clientX - startX)));
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

  const filtered = saved.filter((s) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.snapshot.heading.toLowerCase().includes(q) ||
      s.snapshot.subheading.toLowerCase().includes(q) ||
      s.snapshot.body.toLowerCase().includes(q)
    );
  });

  const railWidth = 56;

  return (
    <aside
      className={`relative flex h-full flex-shrink-0 flex-col overflow-hidden border-r ${resizing ? "" : "transition-[width] duration-300 cubic-bezier(0.23, 1, 0.32, 1)"}`}
      style={{
        width: open ? width : railWidth,
        background: "var(--surface)",
        borderColor: "var(--border)",
        color: "var(--text)",
      }}
    >
      <div className="flex h-full w-full flex-col">
        {/* Header */}
        <header className={`flex items-center h-12 px-4 border-b border-transparent ${open ? "justify-between" : "justify-center"}`}>
          {open && <span className="font-logo text-3xl tracking-tight ml-1 leading-none">Fonty</span>}
          <Tooltip shortcut=".">
            <button
              onClick={onToggle}
              aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
              className="rounded-full p-2 transition-colors duration-150 ease-out hover:bg-[color:var(--bg)]"
              style={{ color: "var(--text-muted)" }}
            >
              <LayoutDashboard className="h-5 w-5" />
            </button>
          </Tooltip>
        </header>

        {/* Action Rail (only when closed) */}
        {!open && (
           <div className="flex flex-col items-center gap-8 mt-6">
              <button
                onClick={onToggle}
                title="Search"
                className="rounded-xl p-2.5 transition-all hover:bg-[color:var(--bg)] hover:scale-110 active:scale-95 shadow-sm"
                style={{
                  color: "var(--text-muted)",
                  background: "color-mix(in oklch, var(--surface-muted) 40%, transparent)",
                  border: "1px solid var(--border)"
                }}
              >
                <Search className="h-5 w-5" />
              </button>
              <button
                onClick={onToggle}
                title="Saved"
                className="rounded-full p-2 transition-all hover:bg-[color:var(--bg)] hover:scale-110 active:scale-95"
                style={{ color: "var(--text-muted)" }}
              >
                <Bookmark className="h-5 w-5" />
              </button>
           </div>
        )}

        {/* Search Bar (only when open) */}
        <div className={`px-3 pb-3 pt-3 transition-all duration-200 ${open ? "opacity-100" : "opacity-0 pointer-events-none h-0 overflow-hidden"}`}>
          <div className="group relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              ref={searchInputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pairings"
              className="peer w-full h-10 rounded-lg border pl-9 pr-14 text-[13px] outline-none transition-colors focus:border-[color:var(--accent)]"
              style={{
                background: "var(--bg)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            />
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 opacity-60 transition-opacity duration-150 ease-out group-hover:opacity-100 peer-focus:opacity-0">
              <Kbd shortcut="K" />
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-3 pb-2">
          {open && (
            <>
              {filtered.length === 0 ? (
                <div
                  className="px-3 py-6 text-[13px] leading-relaxed"
                  style={{ color: "var(--text-muted)" }}
                >
                  {saved.length === 0
                    ? "Hit Save on a pairing you like."
                    : "No matches found."}
                </div>
              ) : (
                <ul className="flex flex-col gap-1">
                  {filtered.map((item) => (
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
            </>
          )}
        </div>

        {/* Footer Area */}
        <div
          className={`pb-4 pt-3 mt-auto flex flex-col items-center border-transparent ${open ? "px-3 border-t" : "px-2"}`}
          style={{ borderColor: "var(--border)" }}
        >
          {open ? (
            <div className="flex w-full items-center justify-between gap-1">
              <button
                onClick={onOpenSettings}
                aria-label="Settings"
                className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-[12px] font-medium transition-colors duration-150 ease-out hover:bg-[color:var(--bg)]"
                style={{ color: "var(--text-muted)" }}
              >
                <SettingsIcon className="h-4 w-4" />
                Settings
              </button>
              <div className="flex items-center gap-0.5">
                <SocialLink href="https://www.linkedin.com/in/leonmatos" label="LinkedIn">
                  <Linkedin className="h-3.5 w-3.5" />
                </SocialLink>
                <SocialLink href="https://github.com/Eligiond" label="GitHub">
                  <Github className="h-3.5 w-3.5" />
                </SocialLink>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenSettings}
              aria-label="Settings"
              className="rounded-lg p-2 transition-colors duration-150 ease-out hover:bg-[color:var(--bg)]"
              style={{ color: "var(--text-muted)" }}
            >
              <SettingsIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {open && (
        <div
          onMouseDown={startResize}
          role="separator"
          aria-label="Resize sidebar"
          aria-orientation="vertical"
          className="absolute right-0 top-0 z-10 h-full w-1.5 cursor-ew-resize select-none transition-colors hover:bg-[color:var(--accent)]"
          style={{ background: resizing ? "var(--accent)" : "transparent" }}
        />
      )}
    </aside>
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
      className="rounded-md p-1.5 transition-colors duration-150 ease-out hover:bg-[color:var(--bg)]"
      style={{ color: "var(--text-muted)" }}
    >
      {children}
    </a>
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
  const inputRef = useRef<HTMLInputElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (rowRef.current && !rowRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
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

  // Four shades for the saved row, derived from the chosen color (or theme default):
  //   1. activeBg     — the strong tint when selected (and matches the dot)
  //   2. hoverBg      — subtle highlight on hover (~14% tint)
  //   3. pressBg      — slightly stronger than hover for click feedback (~22% tint)
  //   4. activeText   — contrast-aware text on the strong tint
  const activeBg = item.color ?? "var(--accent)";
  const hoverBg = item.color
    ? `color-mix(in oklch, ${item.color} 14%, transparent)`
    : "var(--surface-muted)";
  const pressBg = item.color
    ? `color-mix(in oklch, ${item.color} 22%, transparent)`
    : "var(--surface)";
  const activeText = item.color ? getContrastText(item.color) : "var(--accent-text)";
  const accentTextColor = active ? activeText : "var(--text)";

  return (
    <li>
      <div
        ref={rowRef}
        role="button"
        tabIndex={0}
        onClick={() => {
          if (editing) return;
          if (menuOpen) {
            setMenuOpen(false);
            return;
          }
          onLoad();
        }}
        className={`group relative flex h-10 items-center gap-2.5 rounded-lg px-3 text-[13px] transition-[background-color,color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.985] ${editing ? "" : "cursor-pointer"} ${active ? "" : "hover:bg-[var(--row-hover-bg)] active:bg-[var(--row-press-bg)]"}`}
        style={{
          ["--row-hover-bg" as string]: hoverBg,
          ["--row-press-bg" as string]: pressBg,
          ...(active
            ? { background: activeBg, color: activeText }
            : {}),
        }}
      >
        {item.color && (
          <span
            aria-hidden
            className="h-2 w-2 flex-none rounded-full"
            style={{ background: item.color }}
          />
        )}

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
              style={{ color: accentTextColor }}
            />
          ) : (
            <div className="truncate font-medium tracking-tight">{item.name}</div>
          )}
        </div>

        {!editing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            aria-label="More actions"
            aria-expanded={menuOpen}
            className={`flex h-7 w-7 flex-none items-center justify-center rounded-md transition-opacity duration-150 ${menuOpen || active ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"} hover:bg-[color:var(--bg)]`}
            style={{ color: accentTextColor }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        )}

        {menuOpen && (
          <ItemMenu
            currentColor={item.color ?? null}
            onRename={startEdit}
            onDelete={() => {
              setMenuOpen(false);
              onDelete();
            }}
            onSetColor={(c) => {
              onSetColor(c);
            }}
            onClose={() => setMenuOpen(false)}
          />
        )}
      </div>
    </li>
  );
}

function ItemMenu({
  currentColor,
  onRename,
  onDelete,
  onSetColor,
  onClose,
}: {
  currentColor: string | null;
  onRename: () => void;
  onDelete: () => void;
  onSetColor: (color: string | null) => void;
  onClose: () => void;
}) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      role="menu"
      className="absolute right-1 top-full z-30 mt-1 min-w-[180px] rounded-lg border p-1 shadow-lg"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        color: "var(--text)",
      }}
    >
      <button
        role="menuitem"
        onClick={(e) => {
          e.stopPropagation();
          onRename();
        }}
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[12px] font-medium transition-colors duration-150 ease-out hover:bg-[color:var(--bg)]"
      >
        <Pencil className="h-3.5 w-3.5" />
        Rename
      </button>
      <button
        role="menuitem"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[12px] font-medium transition-colors duration-150 ease-out hover:bg-[color:var(--bg)]"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </button>

      <div className="my-1 border-t" style={{ borderColor: "var(--border)" }} />

      <div className="px-2 pb-1.5 pt-1">
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-muted)" }}>
          Color
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {COLOR_OPTIONS.map((c) => {
            const selected = currentColor === c.value;
            const isNone = c.value === null;
            return (
              <button
                key={c.name}
                role="menuitemradio"
                aria-checked={selected}
                aria-label={c.name}
                title={c.name}
                onClick={(e) => {
                  e.stopPropagation();
                  onSetColor(c.value);
                  onClose();
                }}
                className="relative flex h-5 w-5 items-center justify-center rounded-full border transition-transform duration-150 ease-out hover:scale-110"
                style={{
                  background: c.value ?? "transparent",
                  borderColor: c.value ?? "var(--border)",
                }}
              >
                {selected && (
                  <Check
                    className="h-3 w-3"
                    style={{ color: isNone ? "var(--text)" : "#ffffff" }}
                  />
                )}
                {isNone && !selected && (
                  <span
                    aria-hidden
                    className="absolute h-[1px] w-3 rotate-45 rounded-full"
                    style={{ background: "var(--text-muted)" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
