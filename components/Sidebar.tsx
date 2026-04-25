"use client";

import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Github,
  Linkedin,
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
  saved,
  activeId,
  onLoad,
  onRename,
  onDelete,
  onNewRoll,
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

  return (
    <aside
      className="flex h-full flex-shrink-0 flex-col overflow-hidden"
      style={{
        width: open ? 256 : 0,
        transition: "width 280ms cubic-bezier(0.23, 1, 0.32, 1)",
      }}
    >
      {/* Inner fixed-width container so content doesn't compress during animation */}
      <div
        className="flex h-full w-64 flex-col border-r"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--text)",
        }}
      >
        <header className="flex items-center justify-between px-4 pb-3 pt-5">
          <span className="text-lg font-semibold tracking-tight">Fonty</span>
          <button
            onClick={onNewRoll}
            title="New roll (space)"
            aria-label="New roll"
            className="rounded-full p-1.5 transition-colors hover:bg-[color:var(--bg)]"
            style={{ color: "var(--text-muted)" }}
          >
            <Plus className="h-4 w-4" />
          </button>
        </header>

        <div className="px-3 pb-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search saved"
              className="w-full rounded-md border py-1.5 pl-8 pr-2 text-xs outline-none transition-colors focus:border-[color:var(--accent)]"
              style={{
                background: "var(--bg)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-4 pb-1.5">
          <span
            className="text-[10px] uppercase tracking-[0.18em]"
            style={{ color: "var(--text-muted)" }}
          >
            Saved
          </span>
          <span
            className="text-[10px] tabular-nums"
            style={{ color: "var(--text-muted)" }}
          >
            {saved.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {filtered.length === 0 ? (
            <div
              className="px-3 py-6 text-xs leading-relaxed"
              style={{ color: "var(--text-muted)" }}
            >
              {saved.length === 0
                ? "Hit Save on a pairing you like — it'll show up here."
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
        </div>

        <div
          className="border-t px-3 pb-3 pt-3"
          style={{
            background: "var(--surface-muted)",
            borderColor: "var(--border)",
          }}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <button
              onClick={onOpenSettings}
              aria-label="Settings"
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors hover:bg-[color:var(--bg)]"
              style={{ color: "var(--text-muted)" }}
            >
              <SettingsIcon className="h-3.5 w-3.5" />
              Settings
            </button>
            <div className="flex items-center gap-0.5">
              <SocialLink href="https://github.com" label="GitHub">
                <Github className="h-3.5 w-3.5" />
              </SocialLink>
              <SocialLink href="https://www.linkedin.com" label="LinkedIn">
                <Linkedin className="h-3.5 w-3.5" />
              </SocialLink>
              <SocialLink href="https://x.com" label="X (Twitter)">
                <XLogo className="h-3 w-3" />
              </SocialLink>
            </div>
          </div>

          <button
            onClick={onNewRoll}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors"
            style={{
              background: "var(--accent)",
              color: "var(--accent-text)",
            }}
            aria-label="Roll a new pairing"
          >
            <kbd
              className="inline-flex items-center justify-center rounded-md border px-2 py-1 font-mono text-[11px] uppercase tracking-[0.15em]"
              style={{
                borderColor: "color-mix(in oklch, var(--accent-text) 18%, transparent)",
                background: "color-mix(in oklch, var(--accent-text) 10%, transparent)",
              }}
            >
              Space
            </kbd>
            <span className="text-sm font-medium">to roll</span>
          </button>
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
      className="rounded-md p-1.5 transition-colors hover:bg-[color:var(--bg)]"
      style={{ color: "var(--text-muted)" }}
    >
      {children}
    </a>
  );
}

function XLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
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
        tabIndex={editing ? -1 : 0}
        onClick={editing ? undefined : onLoad}
        onKeyDown={(e) => {
          if (!editing && e.key === "Enter") {
            e.preventDefault();
            onLoad();
          }
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          startEdit();
        }}
        className={`group relative flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors ${editing ? "" : "cursor-pointer"}`}
        style={
          active
            ? { background: "var(--accent)", color: "var(--accent-text)" }
            : {}
        }
        onMouseEnter={(e) => {
          if (!active) e.currentTarget.style.background = "var(--bg)";
        }}
        onMouseLeave={(e) => {
          if (!active) e.currentTarget.style.background = "";
        }}
      >
        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onBlur={commit}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter") commit();
                else if (e.key === "Escape") {
                  setDraft(item.name);
                  setEditing(false);
                }
              }}
              className="w-full bg-transparent text-[13px] outline-none"
              style={{ color: active ? "var(--accent-text)" : "var(--text)" }}
            />
          ) : (
            <>
              <div className="truncate font-medium">{item.name}</div>
              <div
                className="truncate text-[11px]"
                style={{
                  color: active
                    ? "color-mix(in oklch, var(--accent-text) 70%, transparent)"
                    : "var(--text-muted)",
                }}
              >
                {item.snapshot.heading} · {item.snapshot.body}
              </div>
            </>
          )}
        </div>

        {!editing && (
          <div
            className={`flex gap-0.5 transition-opacity ${
              active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                startEdit();
              }}
              aria-label="Rename"
              className="rounded p-1"
              style={{
                color: active
                  ? "color-mix(in oklch, var(--accent-text) 70%, transparent)"
                  : "var(--text-muted)",
              }}
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              aria-label="Delete"
              className="rounded p-1"
              style={{
                color: active
                  ? "color-mix(in oklch, var(--accent-text) 70%, transparent)"
                  : "var(--text-muted)",
              }}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
