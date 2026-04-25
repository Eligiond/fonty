"use client";

import { ArrowRight } from "lucide-react";
import { cssFamily, type FontPairing, type FontRole } from "@/lib/fonts";
import EditableText from "@/components/EditableText";
import type { Adjustments } from "@/components/ControlsPanel";

type Props = {
  pairing: FontPairing;
  texts: Record<FontRole, string>;
  onTextChange: (role: FontRole, value: string) => void;
  adjustments: Adjustments;
};

export default function MockupView({
  pairing,
  texts,
  onTextChange,
  adjustments,
}: Props) {
  const adj = adjustments;

  const headingStyle: React.CSSProperties = {
    fontFamily: cssFamily(pairing.heading),
    fontSize: `${adj.heading.fontSize}px`,
    lineHeight: 1.06 * adj.heading.lineHeight,
    letterSpacing: `${adj.heading.letterSpacing}em`,
    fontWeight: 600,
  };
  const subStyle: React.CSSProperties = {
    fontFamily: cssFamily(pairing.subheading),
    fontSize: `${adj.subheading.fontSize}px`,
    lineHeight: 1.5 * adj.subheading.lineHeight,
    letterSpacing: `${adj.subheading.letterSpacing}em`,
    fontWeight: 400,
  };
  const navStyle: React.CSSProperties = { fontFamily: cssFamily(pairing.subheading) };
  const bodyStyle: React.CSSProperties = {
    fontFamily: cssFamily(pairing.body),
    fontSize: `${adj.body.fontSize}px`,
    lineHeight: 1.6 * adj.body.lineHeight,
    letterSpacing: `${adj.body.letterSpacing}em`,
  };

  return (
    <div
      className="flex h-full w-full flex-col overflow-y-auto"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      {/* Nav */}
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-8 py-5">
        <div
          className="text-base font-semibold faux-link"
          style={navStyle}
        >
          Fonty
        </div>
        <nav
          className="hidden items-center gap-7 text-sm md:flex"
          style={{ ...navStyle, color: "var(--text-muted)" }}
        >
          <a className="faux-link transition-colors hover:text-[color:var(--text)]">Explore</a>
          <a className="faux-link transition-colors hover:text-[color:var(--text)]">Saved</a>
          <a className="faux-link transition-colors hover:text-[color:var(--text)]">Themes</a>
          <a className="faux-link transition-colors hover:text-[color:var(--text)]">Export</a>
        </nav>
        <button
          className="faux-link rounded-full px-4 py-2 text-sm transition-shadow"
          style={{
            ...navStyle,
            background: "var(--accent)",
            color: "var(--accent-text)",
          }}
        >
          Get started
        </button>
      </header>

      {/* Hero */}
      <section className="mx-auto w-full max-w-5xl flex-1 px-8 pb-12 pt-10">
        <div className="max-w-4xl">
          <EditableText
            value={texts.heading}
            onChange={(v) => onTextChange("heading", v)}
            ariaLabel="Edit hero headline"
            multiline
            className="tracking-tight"
            style={headingStyle}
          />

          <EditableText
            value={texts.subheading}
            onChange={(v) => onTextChange("subheading", v)}
            ariaLabel="Edit hero subheading"
            multiline
            className="mt-6 max-w-2xl"
            style={{ ...subStyle, color: "var(--text-muted)" }}
          />

          <div className="mt-8 flex flex-wrap gap-3" style={navStyle}>
            <button
              className="faux-link group inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5"
              style={{
                background: "var(--accent)",
                color: "var(--accent-text)",
                boxShadow: "0 2px 6px rgba(0,0,0,0.10)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.18)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.10)";
              }}
            >
              Roll a pairing
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
            <button
              className="faux-link rounded-full border px-5 py-3 text-sm font-medium transition-[transform,background-color,color,border-color] duration-200 hover:-translate-y-0.5"
              style={{
                borderColor: "var(--border)",
                color: "var(--text)",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--accent)";
                e.currentTarget.style.color = "var(--accent-text)";
                e.currentTarget.style.borderColor = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--text)";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              Save this pairing
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderColor: "var(--border)" }} className="border-t">
        <div
          className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-8 py-4 text-xs"
          style={{ ...bodyStyle, color: "var(--text-muted)" }}
        >
          <span>© 2026 Fonty</span>
          <span
            className="text-[10px] uppercase tracking-[0.18em]"
            style={navStyle}
          >
            {pairing.heading} · {pairing.subheading} · {pairing.body}
          </span>
        </div>
      </footer>
    </div>
  );
}

