"use client";

import { cssFamily, type FontPairing, type FontRole } from "@/lib/fonts";
import EditableText from "@/components/EditableText";
import IconButton from "@/components/IconButton";
import type { Adjustments } from "@/components/SidePanel";
import { SquareLock02Icon, SquareUnlock02Icon, Copy01Icon, Tick02Icon } from "@hugeicons/react";
import { useRef, useState } from "react";

export type Texts = Record<FontRole, string>;

type Props = {
  pairing: FontPairing;
  texts: Texts;
  onTextChange: (role: FontRole, value: string) => void;
  adjustments: Adjustments;
  locks: Record<FontRole, boolean>;
  onToggleLock: (role: FontRole) => void;
  offsets: Record<string, number>;
  setOffsets: (v: any) => void;
  widths: Record<string, number>;
  setWidths: (v: any) => void;
};

const DEFAULT_FRACTION = 0.66;
const MIN_PX = 200;

export default function MockupView({
  pairing,
  texts,
  onTextChange,
  adjustments,
  locks,
  onToggleLock,
  offsets = { heading: 0, subheading: 0, body: 0 },
  setOffsets,
  widths = { heading: DEFAULT_FRACTION, subheading: DEFAULT_FRACTION, body: DEFAULT_FRACTION },
  setWidths,
}: Props) {
  const updateOffset = (role: string, dy: number) => {
    setOffsets((prev: any) => ({ ...prev, [role]: (prev?.[role] ?? 0) + dy }));
  };

  const updateWidthFraction = (
    role: string,
    deltaPx: number,
    parentInnerWidth: number,
    chromeWidth: number,
  ) => {
    if (parentInnerWidth <= 0) return;
    setWidths((prev: any) => {
      const currentFrac = prev?.[role] ?? DEFAULT_FRACTION;
      const currentPx = currentFrac * parentInnerWidth;
      const maxPx = Math.max(MIN_PX, parentInnerWidth - chromeWidth);
      const nextPx = Math.min(maxPx, Math.max(MIN_PX, currentPx + deltaPx));
      return { ...prev, [role]: nextPx / parentInnerWidth };
    });
  };

  const headingStyle: React.CSSProperties = {
    fontFamily: cssFamily(pairing.heading),
    fontSize: `${adjustments.heading.fontSize * 1.2}px`,
    lineHeight: 1.1 * adjustments.heading.lineHeight,
    letterSpacing: `${adjustments.heading.letterSpacing}em`,
    fontWeight: "600",
    color: "var(--text)",
  };
  const subStyle: React.CSSProperties = {
    fontFamily: cssFamily(pairing.subheading),
    fontSize: `${adjustments.subheading.fontSize}px`,
    lineHeight: 1.4 * adjustments.subheading.lineHeight,
    letterSpacing: `${adjustments.subheading.letterSpacing}em`,
    fontWeight: "500",
    color: "var(--text)",
  };
  const bodyStyle: React.CSSProperties = {
    fontFamily: cssFamily(pairing.body),
    fontSize: `${adjustments.body.fontSize}px`,
    lineHeight: 1.6 * adjustments.body.lineHeight,
    letterSpacing: `${adjustments.body.letterSpacing}em`,
    fontWeight: "400",
    color: "var(--text)",
  };

  return (
    <div
      className="flex h-full w-full flex-col overflow-y-auto overflow-x-hidden select-none"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      <div className="w-full px-12 flex flex-col flex-1 py-32 md:py-48 gap-16">
        
        {/* Heading Block */}
        <FontBlock
          role="heading"
          label="H1 · Heading"
          family={pairing.heading}
          locked={locks.heading}
          onToggleLock={() => onToggleLock("heading")}
          text={texts.heading}
          onTextChange={(v) => onTextChange("heading", v)}
          style={headingStyle}
          className="tracking-tighter"
          offset={offsets?.heading ?? 0}
          widthFraction={widths?.heading ?? DEFAULT_FRACTION}
          onDragY={(dy) => updateOffset("heading", dy)}
          onDragW={(dw, parentW, chromeW) => updateWidthFraction("heading", dw, parentW, chromeW)}
        />

        {/* Subheading Block */}
        <FontBlock
          role="subheading"
          label="H3 · Subheading"
          family={pairing.subheading}
          locked={locks.subheading}
          onToggleLock={() => onToggleLock("subheading")}
          text={texts.subheading}
          onTextChange={(v) => onTextChange("subheading", v)}
          style={subStyle}
          offset={offsets?.subheading ?? 0}
          widthFraction={widths?.subheading ?? DEFAULT_FRACTION}
          onDragY={(dy) => updateOffset("subheading", dy)}
          onDragW={(dw, parentW, chromeW) => updateWidthFraction("subheading", dw, parentW, chromeW)}
        />

        {/* Body Block */}
        <FontBlock
          role="body"
          label="P · Body"
          family={pairing.body}
          locked={locks.body}
          onToggleLock={() => onToggleLock("body")}
          text={texts.body}
          onTextChange={(v) => onTextChange("body", v)}
          style={bodyStyle}
          offset={offsets?.body ?? 0}
          widthFraction={widths?.body ?? DEFAULT_FRACTION}
          onDragY={(dy) => updateOffset("body", dy)}
          onDragW={(dw, parentW, chromeW) => updateWidthFraction("body", dw, parentW, chromeW)}
        />

      </div>
    </div>
  );
}

const HANDLE_GAP = 16;
const HANDLE_BUTTON = 36;
const HANDLE_INFO_MIN_GAP = 24;

function FontBlock({
  role, label, family, locked, onToggleLock, text, onTextChange, style, className = "",
  offset, widthFraction, onDragY, onDragW
}: {
  role: FontRole;
  label: string;
  family: string;
  locked: boolean;
  onToggleLock: () => void;
  text: string;
  onTextChange: (v: string) => void;
  style: React.CSSProperties;
  className?: string;
  offset: number;
  widthFraction: number;
  onDragY: (dy: number) => void;
  onDragW: (deltaPx: number, parentInnerWidth: number, chromeWidth: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLElement>(null);

  const handleMouseDownY = (e: React.MouseEvent) => {
    e.preventDefault();
    const onMove = (ev: MouseEvent) => onDragY(ev.movementY);
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const handleMouseDownW = (e: React.MouseEvent) => {
    e.preventDefault();
    const onMove = (ev: MouseEvent) => {
      const parentW = containerRef.current?.clientWidth ?? 0;
      const infoW = infoRef.current?.offsetWidth ?? 0;
      const chromeW = infoW + HANDLE_GAP + HANDLE_BUTTON + HANDLE_INFO_MIN_GAP;
      onDragW(ev.movementX, parentW, chromeW);
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // Reserve space on the right for the chrome (handle + spacer + info aside).
  // The handle+spacer take ~76px, the info aside is ~228px → ~304px reserved.
  const CHROME_RESERVE_PX = 320;

  return (
    <div
      ref={containerRef}
      className="group relative flex items-center w-full"
      style={{ transform: `translateY(${offset}px)` }}
    >
      {/* Specimen Column — width is a fraction of the parent so it reflows when the panel toggles */}
      <div
        className="relative border-r-2 border-transparent transition-[background-color,border-color] duration-300 group-hover:border-[var(--border)] hover:!border-[var(--accent)] flex-shrink-0"
        style={{
          width: `${widthFraction * 100}%`,
          minWidth: `${MIN_PX}px`,
          maxWidth: `calc(100% - ${CHROME_RESERVE_PX}px)`,
          background: locked ? "color-mix(in oklch, var(--accent) 4%, transparent)" : "transparent",
          borderRadius: "8px",
        }}
      >
        <EditableText
          value={text}
          onChange={onTextChange}
          ariaLabel={`Edit ${label}`}
          multiline
          className={`min-w-0 overflow-wrap-anywhere break-words w-full px-2 -mx-2 ${className}`}
          style={style}
        />

        {/* Invisible Resize Trigger Area */}
        <div
          onMouseDown={handleMouseDownW}
          className="absolute -right-2 top-0 bottom-0 w-4 cursor-ew-resize z-10"
        />
      </div>

      {/* Drag Handle - Pinned at fixed gap from text-box right edge */}
      <div className="flex-shrink-0" style={{ paddingLeft: `${HANDLE_GAP}px` }}>
        <button
          onMouseDown={handleMouseDownY}
          className="p-2 rounded-lg opacity-0 group-hover:opacity-20 hover:!opacity-100 hover:bg-[var(--surface-muted)] transition-all cursor-pointer active:cursor-grabbing active:scale-95"
          style={{ color: "var(--text)" }}
          title="Drag to reposition"
        >
          <NineDotsIcon />
        </button>
      </div>

      {/* Flexible spacer pushes info to the right */}
      <div className="flex-1" style={{ minWidth: `${HANDLE_INFO_MIN_GAP}px` }} />

      {/* Font Information - Pinned right, fixed column width for cross-row alignment */}
      <aside ref={infoRef} className="flex flex-shrink-0 items-center gap-3 text-right">
        <div className="w-[140px]">
          <div
            className="text-[11px] uppercase tracking-[0.16em] opacity-80 truncate"
            style={{ color: "var(--text)" }}
          >
            {label}
          </div>
          <div
            className="mt-0.5 truncate text-[14px] font-medium"
            style={{ fontFamily: cssFamily(family), color: "var(--text)" }}
          >
            {family}
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1.5">
          <CopyButton family={family} role={role} label={label} locked={locked} />
          <LockButton locked={locked} onToggle={onToggleLock} />
        </div>
      </aside>
    </div>
  );
}

function NineDotsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" className="opacity-100">
      <circle cx="2" cy="2" r="1.5" />
      <circle cx="7" cy="2" r="1.5" />
      <circle cx="12" cy="2" r="1.5" />
      <circle cx="2" cy="7" r="1.5" />
      <circle cx="7" cy="7" r="1.5" />
      <circle cx="12" cy="7" r="1.5" />
      <circle cx="2" cy="12" r="1.5" />
      <circle cx="7" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  );
}

function LockButton({
  locked,
  onToggle,
}: {
  locked: boolean;
  onToggle: () => void;
}) {
  return (
    <IconButton
      onClick={onToggle}
      active={locked}
      ariaLabel={locked ? "Unlock font" : "Lock font"}
      title={locked ? "Unlock font" : "Lock font"}
    >
      {locked ? <SquareLock02Icon size={18} /> : <SquareUnlock02Icon size={18} />}
    </IconButton>
  );
}

function CopyButton({
  family,
  role,
  label,
  locked,
}: {
  family: string;
  role: FontRole;
  label: string;
  locked: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const config = `// font: ${label}\nfamily: '${family}',\nrole: '${role}',\nlocked: ${locked}`;
      await navigator.clipboard.writeText(config);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <IconButton
      onClick={handleCopy}
      active={copied}
      ariaLabel="Copy font config"
      title="Copy font config"
    >
      {copied ? <Tick02Icon size={18} /> : <Copy01Icon size={18} />}
    </IconButton>
  );
}
