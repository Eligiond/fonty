"use client";

import { ArrowRight, Lock, Unlock, Sparkles } from "lucide-react";
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
    letterSpacing: `${adj.heading.letterSpacing}em`,
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
    lineHeight: 1.6 * adj.body.lineHeight,
    letterSpacing: `${adj.body.letterSpacing}em`,
    textAlign: "left",
  };

  const navStyle: React.CSSProperties = { fontFamily: "Montserrat, sans-serif" };

  return (
    <div
      className="flex h-full w-full flex-col overflow-y-auto scroll-smooth"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      <div className="mx-auto w-full max-w-6xl px-10 flex flex-col min-h-full">
        {/* Nav - reduced padding */}
        <header className="flex items-center justify-between py-4">
          <div className="font-logo text-lg faux-link">Fonty</div>
          <nav
            className="hidden items-center gap-10 text-[12px] font-semibold md:flex"
            style={{ ...navStyle, color: "var(--text-muted)" }}
          >
            <a className="faux-link transition-all hover:text-[color:var(--text)]">Product</a>
            <a className="faux-link transition-all hover:text-[color:var(--text)]">Changelog</a>
            <a className="faux-link transition-all hover:text-[color:var(--text)]">Pricing</a>
          </nav>
          <button
            className="faux-link rounded-full px-5 py-1.5 text-[12px] font-bold transition-all hover:opacity-90 active:scale-95"
            style={{
              background: "var(--accent)",
              color: "var(--accent-text)",
            }}
          >
            Get started
          </button>
        </header>

        {/* Hero Section - tightened vertical spacing */}
        <section className="pt-3 pb-3">
          <div className="flex flex-col items-start max-w-4xl">
            <div 
              className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em]"
              style={{ 
                borderColor: "var(--border)", 
                color: "var(--text-muted)",
                fontFamily: "Montserrat, sans-serif"
              }}
            >
              <Sparkles className="h-3 w-3 text-yellow-500 animate-pulse" />
              Next-gen Typeset Pairing
            </div>

            <EditableText
              value={texts.heading}
              onChange={(v) => onTextChange("heading", v)}
              ariaLabel="Edit hero headline"
              multiline
              className="tracking-tighter"
              style={headingStyle}
            />

            <EditableText
              value={texts.subheading}
              onChange={(v) => onTextChange("subheading", v)}
              ariaLabel="Edit hero subheading"
              multiline
              className="mt-4 max-w-2xl"
              style={{ ...subStyle, color: "var(--text-muted)" }}
            />

            <div className="mt-4 flex flex-wrap gap-3" style={navStyle}>
              <button
                className="faux-link group inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold transition-all hover:opacity-90 active:scale-95"
                style={{
                  background: "var(--accent)",
                  color: "var(--accent-text)",
                }}
              >
                Start free trial
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <button
                className="faux-link rounded-full border px-6 py-2.5 text-xs font-bold transition-all hover:bg-[color:var(--surface)] active:scale-95"
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

        {/* Intentional Typography Section */}
        <section className="py-2">
           <div className="max-w-4xl">
             <EditableText
               value={texts.body}
               onChange={(v) => onTextChange("body", v)}
               ariaLabel="Edit product body"
               multiline
               className="leading-relaxed text-[15px]"
               style={{ ...bodyStyle, color: "var(--text-muted)", opacity: 0.8 }}
             />
           </div>
        </section>

        {/* Simple Website Mockup Footer - reduced height */}
        <footer className="mt-auto">
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: "var(--border)" }}>
             <span className="font-logo text-xs opacity-50">fonty 2026 ©</span>
             <div className="flex gap-4">
                <div className="h-1 w-6 rounded-full opacity-10" style={{ background: "var(--text)" }} />
                <div className="h-1 w-6 rounded-full opacity-10" style={{ background: "var(--text)" }} />
                <div className="h-1 w-6 rounded-full opacity-10" style={{ background: "var(--text)" }} />
             </div>
          </div>
        </footer>

        {/* 3-Column Font Information Grid - Rectangle format (reduced padding) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-0 border-x border-b mb-2" style={{ borderColor: "var(--border)" }}>
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
  return (
    <div className={`px-5 py-4 flex flex-col gap-2 items-start transition-colors hover:bg-[color:var(--surface)] group ${className}`} style={{ borderColor: "var(--border)" }}>
      <div className="flex w-full items-center justify-between">
         <span className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40" style={{ fontFamily: "Montserrat, sans-serif" }}>{label}</span>
         <button 
           onClick={onToggle}
           className={`rounded-full p-1.5 transition-all hover:scale-110 active:scale-90 border ${locked ? "bg-[color:var(--text)] text-[color:var(--bg)] border-[color:var(--text)]" : "border-[color:var(--border)] text-[color:var(--text-muted)]"}`}
         >
           {locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
         </button>
      </div>
      <div className="flex flex-col">
        <span className="text-[15px] font-bold tracking-tight truncate max-w-[180px]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{family}</span>
        <span className="text-[9px] opacity-40 mt-0.5" style={{ fontFamily: "Montserrat, sans-serif" }}>Google Fonts</span>
      </div>
    </div>
  );
}
