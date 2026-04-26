"use client";

import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Search,
  Pencil,
  Trash2,
  Github,
  Heart,
  Settings as SettingsIcon,
} from "lucide-react";
import type { FontPairing } from "@/lib/fonts";
import type { ThemeId } from "@/lib/themes";

export type SavedItem = {
  id: string;
  name: string;
  snapshot: FontPairing;
};

type Props = {
  open: boolean;
  onToggle: () => void;
  saved: SavedItem[];
  activeId: string | null;
  onLoad: (item: SavedItem) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onNewRoll: () => void;
  onOpenSettings: () => void;
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
  isDark: boolean;
  setIsDark: (v: boolean) => void;
};

export default function Sidebar({
  open,
  onToggle,
  saved,
  activeId,
  onLoad,
  onRename,
  onDelete,
  onOpenSettings,
}: Props) {
  const [query, setQuery] = useState("");

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

  // The TopBar is h-12 (48px). Sidebar collapsed width should be 48px to match.
  const collapsedWidth = 48;

  return (
    <aside
      className="flex h-full flex-shrink-0 flex-col overflow-hidden border-r transition-[width] duration-300 cubic-bezier(0.23, 1, 0.32, 1)"
      style={{
        width: open ? 240 : collapsedWidth,
        background: "var(--surface)",
        borderColor: "var(--border)",
        color: "var(--text)",
      }}
    >
      <div className="flex h-full w-full flex-col">
        {/* Header */}
        <header className={`flex items-center pt-4 pb-3 px-3 mb-2 ${open ? "justify-between" : "justify-center"}`}>
          {open && <span className="font-logo text-lg tracking-tight">Fonty</span>}
          <button
            onClick={onToggle}
            title={open ? "Collapse" : "Expand"}
            className="rounded-full p-1.5 transition-all duration-300 hover:bg-[color:var(--bg)]"
            style={{ color: "var(--text-muted)" }}
          >
            <LayoutDashboard className="h-5 w-5" />
          </button>
        </header>

        {/* Action Rail (only when closed) - matching icon sizes exactly */}
        {!open && (
           <div className="flex flex-col items-center gap-6 mt-2">
              <button
                onClick={onToggle}
                title="Search"
                className="rounded-full p-2 transition-colors hover:bg-[color:var(--bg)]"
                style={{ color: "var(--text-muted)" }}
              >
                <Search className="h-5 w-5" />
              </button>
              <button
                onClick={onToggle}
                title="Saved"
                className="rounded-full p-2 transition-colors hover:bg-[color:var(--bg)]"
                style={{ color: "var(--text-muted)" }}
              >
                <Heart className="h-5 w-5" />
              </button>
           </div>
        )}

        {/* Search Bar (only when open) */}
        <div className={`px-4 pb-4 transition-all duration-200 ${open ? "opacity-100" : "opacity-0 pointer-events-none h-0 overflow-hidden"}`}>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-full border py-1.5 pl-9 pr-3 text-xs outline-none transition-colors focus:border-[color:var(--accent)]"
              style={{
                background: "var(--bg)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {open && (
            <>
              {filtered.length === 0 ? (
                <div
                  className="px-4 py-8 text-xs leading-relaxed"
                  style={{ color: "var(--text-muted)" }}
                >
                  {saved.length === 0
                    ? "Hit Save on a pairing you like."
                    : "No matches."}
                </div>
              ) : (
                <ul className="flex flex-col gap-0.5">
                  {filtered.map((item) => (
                    <SavedRow
                      key={item.id}
                      item={item}
                      active={item.id === activeId}
                      onLoad={() => onLoad(item)}
                      onRename={(name) => onRename(item.id, name)}
                      onDelete={() => onDelete(item.id)}
                    />
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        {/* Footer Area */}
        <div
          className={`pb-6 pt-4 mt-auto flex flex-col items-center ${open ? "px-4 border-t" : "px-2"}`}
          style={{ borderColor: "var(--border)" }}
        >
          {open ? (
            <div className="flex w-full items-center justify-between gap-2">
              <button
                onClick={onOpenSettings}
                aria-label="Settings"
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[color:var(--bg)]"
                style={{ color: "var(--text-muted)" }}
              >
                <SettingsIcon className="h-4 w-4" />
                Settings
              </button>
              <SocialLink href="https://github.com" label="GitHub">
                <Github className="h-4 w-4" />
              </SocialLink>
            </div>
          ) : (
            <button
              onClick={onOpenSettings}
              aria-label="Settings"
              className="rounded-full p-2 transition-colors hover:bg-[color:var(--bg)]"
              style={{ color: "var(--text-muted)" }}
            >
              <SettingsIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
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
      className="rounded-full p-1.5 transition-colors hover:bg-[color:var(--bg)]"
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
}: {
  item: SavedItem;
  active: boolean;
  onLoad: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const startEdit = () => {
    setDraft(item.name);
    setEditing(true);
  };

  const commit = () => {
    const next = draft.trim();
    if (next && next !== item.name) onRename(next);
    setEditing(false);
  };

  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        onClick={editing ? undefined : onLoad}
        className={`group relative flex items-center gap-3 rounded-full px-4 py-2 text-[13px] transition-all ${editing ? "" : "cursor-pointer"}`}
        style={
          active
            ? { background: "var(--accent)", color: "var(--accent-text)" }
            : {}
        }
      >
        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              className="w-full bg-transparent outline-none"
              style={{ color: active ? "var(--accent-text)" : "var(--text)" }}
            />
          ) : (
            <div className="truncate font-medium">{item.name}</div>
          )}
        </div>

        {!editing && (
          <div className={`flex gap-1 transition-opacity ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
            <button onClick={(e) => { e.stopPropagation(); startEdit(); }} className="p-1 hover:scale-110"><Pencil className="h-3 w-3" /></button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 hover:scale-110"><Trash2 className="h-3 w-3" /></button>
          </div>
        )}
      </div>
    </li>
  );
}
