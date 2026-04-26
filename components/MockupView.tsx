"use client";

import { useState } from "react";
import { ArrowRight, Lock, Unlock, Copy, Check } from "lucide-react";
import { cssFamily, type FontPairing, type FontRole } from "@/lib/fonts";
import EditableText from "@/components/EditableText";
import type { Adjustments } from "@/components/ControlsPanel";

type Props = {
  pairing: FontPairing;
  texts: Record<FontRole, string>;
  onTextChange: (role: FontRole, value: string) => void;
  adjustments: Adjustments;
  locks: Record<FontRole, boolean>;
  onToggleLock: (role: FontRole) => void;
};

export default function MockupView({
  pairing,
  texts,
  onTextChange,
  adjustments,
  locks,
  onToggleLock,
}: Props) {
  const adj = adjustments;

  const headingStyle: React.CSSProperties = {
    fontFamily: cssFamily(pairing.heading),
    fontSize: `${adj.heading.fontSize}px`,
    lineHeight: 1.06 * adj.heading.lineHeight,
    letterSpacing: `${adj.heading.letterSpacing - 0.018}em`,
    fontWeight: 700,
    textAlign: "left",
  };
  const subStyle: React.CSSProperties = {
    fontFamily: cssFamily(pairing.subheading),
    fontSize: `${adj.subheading.fontSize}px`,
    lineHeight: 1.5 * adj.subheading.lineHeight,
    letterSpacing: `${adj.subheading.letterSpacing}em`,
    fontWeight: 400,
    textAlign: "left",
  };
  const bodyStyle: React.CSSProperties = {
    fontFamily: cssFamily(pairing.body),
    fontSize: `${adj.body.fontSize}px`,
    lineHeight: 1.7 * adj.body.lineHeight,
    letterSpacing: `${adj.body.letterSpacing}em`,
    textAlign: "left",
  };

  const navStyle: React.CSSProperties = { fontFamily: "Montserrat, sans-serif" };

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      {/* Centered content container - flex-1 to fill available space */}
      <div className="mx-auto w-full max-w-6xl px-10 flex flex-1 flex-col min-h-0">
        {/* Nav */}
        <header className="flex flex-none items-center justify-between py-7">
          <div className="font-logo text-2xl faux-link">Fonty</div>
          <nav
            className="hidden items-center gap-14 text-[14px] font-semibold md:flex"
            style={{ ...navStyle, color: "var(--text-muted)" }}
          >
            <a className="faux-link transition-colors duration-150 ease-out hover:text-[color:var(--text)]">Product</a>
            <a className="faux-link transition-colors duration-150 ease-out hover:text-[color:var(--text)]">Changelog</a>
            <a className="faux-link transition-colors duration-150 ease-out hover:text-[color:var(--text)]">Pricing</a>
          </nav>
          <button
            className="faux-link rounded-full border px-6 py-2 text-[13px] font-semibold transition-[background-color,border-color] duration-150 ease-out active:scale-[0.97] hover:bg-[color:var(--surface-muted)]"
            style={{
              background: "transparent",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          >
            Get started
          </button>
        </header>

        {/* Main content - hero and body grouped together with consistent rhythm */}
        <div className="flex flex-1 flex-col min-h-0 py-8">
          {/* Hero Section */}
          <section>
            <div className="flex flex-col items-start max-w-3xl">
              <EditableText
                value={texts.heading}
                onChange={(v) => onTextChange("heading", v)}
                ariaLabel="Edit hero headline"
                multiline
                className="tracking-tighter mb-6"
                style={headingStyle}
              />

              <EditableText
                value={texts.subheading}
                onChange={(v) => onTextChange("subheading", v)}
                ariaLabel="Edit hero subheading"
                multiline
                className="max-w-2xl mb-8"
                style={{ ...subStyle, color: "var(--text-muted)" }}
              />

              <div className="flex flex-wrap gap-3" style={navStyle}>
                <button
                  className="faux-link group inline-flex items-center gap-2.5 rounded-full px-7 py-3 text-[13px] font-bold transition-[box-shadow,transform] duration-200 ease-out active:scale-[0.97] shadow-md hover:shadow-lg"
                  style={{
                    background: "var(--text-muted)",
                    color: "var(--accent-text)",
                  }}
                >
                  Start free trial
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                </button>
                <button
                  className="faux-link group relative inline-flex items-center gap-2.5 rounded-full border px-7 py-3 text-[13px] font-bold transition-[background-color,border-color,transform,box-shadow] duration-[220ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] hover:-translate-y-px hover:bg-[color:var(--surface-muted)] hover:border-[color:var(--text-muted)] hover:shadow-[0_4px_12px_-4px_color-mix(in_oklch,var(--text)_25%,transparent)]"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text)",
                    background: "transparent",
                  }}
                >
                  Book a demo
                </button>
              </div>
            </div>
          </section>

          {/* Body Section — pt-8 mirrors the subheading→buttons gap (mb-8) above */}
          <section className="pt-8">
            <div className="max-w-3xl">
              <EditableText
                value={texts.body}
                onChange={(v) => onTextChange("body", v)}
                ariaLabel="Edit product body"
                multiline
                className="leading-relaxed opacity-80"
                style={{ ...bodyStyle, color: "var(--text-muted)" }}
              />
            </div>
          </section>
        </div>
      </div>

      {/* Footer Area - architectural symmetry */}
      <footer className="mt-auto flex flex-col">
        {/* Full-width horizontal line (spanning whole page within content area) */}
        <div className="w-full h-px" style={{ background: "var(--border)" }} />
        
        <div className="mx-auto w-full max-w-6xl px-10">
          {/* 3-Column Font Information Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-0 border-x border-b" style={{ borderColor: "var(--border)" }}>
            <FontInfoBox 
              role="heading" 
              label="H1 · Heading" 
              family={pairing.heading} 
              locked={locks.heading} 
              onToggle={() => onToggleLock("heading")} 
            />
            <FontInfoBox 
              role="subheading" 
              label="H3 · Subheading" 
              family={pairing.subheading} 
              locked={locks.subheading} 
              onToggle={() => onToggleLock("subheading")} 
              className="border-y md:border-y-0 md:border-x"
            />
            <FontInfoBox 
              role="body" 
              label="P · Body" 
              family={pairing.body} 
              locked={locks.body} 
              onToggle={() => onToggleLock("body")} 
            />
          </section>

        </div>
      </footer>
    </div>
  );
}

function FontInfoBox({ 
  label, 
  family, 
  locked, 
  onToggle, 
  className = "",
  role
}: { 
  label: string, 
  family: string, 
  locked: boolean, 
  onToggle: () => void,
  className?: string,
  role: FontRole
}) {
  const [copied, setCopied] = useState(false);

  const copyFont = async () => {
    try {
      const config = `// font: ${label}\nfamily: '${family}',\nrole: '${role}',\nlocked: ${locked}`;
      await navigator.clipboard.writeText(config);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className={`px-8 py-6 flex flex-col gap-4 items-start transition-colors hover:bg-[color:var(--surface)] group ${className}`} style={{ borderColor: "var(--border)" }}>
      <div className="flex w-full items-center justify-between">
         {/* H1, H3, P made larger as requested */}
         <span className="text-[14px] font-bold uppercase tracking-[0.3em] opacity-50" style={{ fontFamily: "Montserrat, sans-serif" }}>{label}</span>
         <div className="flex items-center gap-3">
            <button 
              onClick={copyFont}
              title="Copy font config"
              className="rounded-full p-2.5 transition-all hover:scale-110 active:scale-90 border border-[color:var(--border)] text-[color:var(--text-muted)] hover:text-[color:var(--text)]"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
            <button 
              onClick={onToggle}
              title={locked ? "Unlock font" : "Lock font"}
              className={`rounded-full p-2.5 transition-all hover:scale-110 active:scale-90 border ${locked ? "bg-[color:var(--text)] text-[color:var(--bg)] border-[color:var(--text)]" : "border-[color:var(--border)] text-[color:var(--text-muted)]"}`}
            >
              {locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            </button>
         </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xl font-bold tracking-tight truncate max-w-[240px]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{family}</span>
        <span className="text-[12px] opacity-40 mt-1" style={{ fontFamily: "Montserrat, sans-serif" }}>Google Fonts</span>
      </div>
    </div>
  );
}
