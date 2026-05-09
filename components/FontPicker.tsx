"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FONT_CATALOGUE, buildUrlForFamilies, cssFamily } from "@/lib/fonts";

type Props = {
  currentFamily: string;
  anchorRect: DOMRect;
  onSelect: (family: string) => void;
  onClose: () => void;
};

const WIDTH = 264;
const MAX_HEIGHT = 320;
const BATCH = 48;

const injected = new Set<string>();

function loadFonts(families: string[]) {
  if (families.length === 0) return;
  const url = buildUrlForFamilies(families);
  if (!url || injected.has(url)) return;
  injected.add(url);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
}

export default function FontPicker({ currentFamily, anchorRect, onSelect, onClose }: Props) {
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLButtonElement>(null);

  const filtered = query.trim()
    ? FONT_CATALOGUE.filter(
        ({ family, vibe }) =>
          family.toLowerCase().includes(query.toLowerCase()) ||
          vibe.toLowerCase().includes(query.toLowerCase()),
      )
    : FONT_CATALOGUE;

  const top =
    anchorRect.bottom + MAX_HEIGHT + 4 > window.innerHeight
      ? Math.max(8, anchorRect.top - MAX_HEIGHT - 4)
      : anchorRect.bottom + 4;

  let left = anchorRect.left;
  if (left + WIDTH > window.innerWidth - 8) left = window.innerWidth - WIDTH - 8;
  if (left < 8) left = 8;

  // Load visible fonts
  useEffect(() => {
    loadFonts(filtered.slice(0, BATCH).map((f) => f.family));
  }, [filtered]);

  // Scroll current into view on open
  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: "nearest" });
  }, []);

  // Click-outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return createPortal(
    <div
      ref={containerRef}
      className="fixed z-[9999] flex flex-col overflow-hidden rounded-xl border shadow-2xl"
      style={{
        top,
        left,
        width: WIDTH,
        maxHeight: MAX_HEIGHT,
        background: "var(--bg)",
        borderColor: "var(--border)",
      }}
    >
      {/* Search bar */}
      <div
        className="flex flex-shrink-0 items-center gap-2 border-b px-3 py-2.5"
        style={{ borderColor: "var(--border)" }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 13 13"
          fill="none"
          className="flex-shrink-0 opacity-40"
          style={{ color: "var(--text)" }}
        >
          <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
          <line x1="9" y1="9" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search fonts…"
          className="flex-1 bg-transparent text-[13px] outline-none placeholder:opacity-35"
          style={{ color: "var(--text)" }}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="opacity-30 hover:opacity-60 transition-opacity text-[11px]"
            style={{ color: "var(--text)" }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Font list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p
            className="px-3 py-6 text-center text-[12px] opacity-35"
            style={{ color: "var(--text)" }}
          >
            No fonts found
          </p>
        ) : (
          <ul>
            {filtered.map(({ family, vibe }) => {
              const active = family === currentFamily;
              return (
                <li key={family}>
                  <button
                    ref={active ? currentRef : undefined}
                    onClick={() => {
                      onSelect(family);
                      onClose();
                    }}
                    className="flex w-full items-center justify-between px-3 py-[7px] text-left transition-none"
                    style={{
                      background: active ? "color-mix(in oklch, var(--accent) 12%, var(--bg))" : "transparent",
                      color: "var(--text)",
                    }}
                    onMouseEnter={(e) => {
                      if (!active)
                        (e.currentTarget as HTMLElement).style.background = "var(--surface)";
                    }}
                    onMouseLeave={(e) => {
                      if (!active)
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    <span
                      className="truncate text-[14px] leading-none"
                      style={{ fontFamily: cssFamily(family) }}
                    >
                      {family}
                    </span>
                    <span
                      className="ml-2 flex-shrink-0 text-[10px] uppercase tracking-wide opacity-40"
                      style={{ color: "var(--text)" }}
                    >
                      {vibe}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>,
    document.body,
  );
}
