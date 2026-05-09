"use client";

import { cssFamily, type FontPairing, type FontRole, type FontSlot, MIN_SLOTS, MAX_SLOTS } from "@/lib/fonts";
import EditableText from "@/components/EditableText";
import IconButton from "@/components/IconButton";
import { Tooltip } from "@/components/Tooltip";
import FontPicker from "@/components/FontPicker";
import type { Adjustments } from "@/components/SidePanel";
import {
  SquareLock02Icon,
  SquareUnlock02Icon,
  Copy01Icon,
  Tick02Icon,
  Cancel01Icon,
  PlusSignIcon,
  DragDropVerticalIcon,
} from "@hugeicons/react";
import { useRef, useState } from "react";

export type Texts = Record<FontRole, string>;

const ROLE_LABEL: Record<FontRole, string> = {
  heading: "H1 · Heading",
  subheading: "H3 · Subheading",
  body: "P · Body",
  caption: "C · Caption",
};

const ROLE_FONT_SIZE_SCALE: Record<FontRole, number> = {
  heading: 1.2,
  subheading: 1.0,
  body: 1.0,
  caption: 1.0,
};

const ROLE_LINE_HEIGHT: Record<FontRole, number> = {
  heading: 1.1,
  subheading: 1.4,
  body: 1.6,
  caption: 1.4,
};

const ROLE_WEIGHT: Record<FontRole, string> = {
  heading: "600",
  subheading: "500",
  body: "400",
  caption: "500",
};

type PickerTarget = { role: FontRole; rect: DOMRect };

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
  onAddSlot: () => void;
  onRemoveSlot: (role: FontRole) => void;
  onFontChange?: (role: FontRole, family: string) => void;
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
  offsets = {},
  setOffsets,
  widths = {},
  setWidths,
  onAddSlot,
  onRemoveSlot,
  onFontChange,
}: Props) {
  const slots = pairing.slots;
  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);
  const canAdd = slots.length < MAX_SLOTS;
  const canRemove = slots.length > MIN_SLOTS;

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

  const buildStyle = (slot: FontSlot): React.CSSProperties => {
    const adj = adjustments[slot.role];
    return {
      fontFamily: cssFamily(slot.family),
      fontSize: `${adj.fontSize * ROLE_FONT_SIZE_SCALE[slot.role]}px`,
      lineHeight: ROLE_LINE_HEIGHT[slot.role] * adj.lineHeight,
      letterSpacing: `${adj.letterSpacing}em`,
      fontWeight: ROLE_WEIGHT[slot.role],
      color: "var(--text)",
    };
  };

  const openPicker = (role: FontRole, rect: DOMRect) => setPickerTarget({ role, rect });
  const closePicker = () => setPickerTarget(null);

  return (
    <>
      <div
        className="flex h-full w-full flex-col overflow-y-auto overflow-x-hidden select-none"
        style={{ background: "var(--bg)", color: "var(--text)" }}
      >
        <div className="w-full px-12 flex flex-col flex-1 py-32 md:py-48 gap-16">
          {slots.map((slot, idx) => (
            <FontBlock
              key={slot.role}
              slot={slot}
              label={ROLE_LABEL[slot.role]}
              locked={locks[slot.role]}
              onToggleLock={() => onToggleLock(slot.role)}
              text={texts[slot.role]}
              onTextChange={(v) => onTextChange(slot.role, v)}
              style={buildStyle(slot)}
              className={slot.role === "heading" ? "tracking-tighter" : ""}
              offset={offsets?.[slot.role] ?? 0}
              widthFraction={widths?.[slot.role] ?? DEFAULT_FRACTION}
              onDragY={(dy) => updateOffset(slot.role, dy)}
              onDragW={(dw, parentW, chromeW) => updateWidthFraction(slot.role, dw, parentW, chromeW)}
              canRemove={canRemove}
              onRemove={() => onRemoveSlot(slot.role)}
              canAdd={canAdd}
              isLast={idx === slots.length - 1}
              onAddAfter={onAddSlot}
              onOpenPicker={onFontChange ? openPicker : undefined}
            />
          ))}
        </div>
      </div>
      {pickerTarget && onFontChange && (
        <FontPicker
          currentFamily={pairing.slots.find((s) => s.role === pickerTarget.role)?.family ?? ""}
          anchorRect={pickerTarget.rect}
          onSelect={(family) => onFontChange(pickerTarget.role, family)}
          onClose={closePicker}
        />
      )}
    </>
  );
}

const HANDLE_GAP = 16;
const HANDLE_BUTTON = 36;
const HANDLE_INFO_MIN_GAP = 24;

function FontBlock({
  slot,
  label,
  locked,
  onToggleLock,
  text,
  onTextChange,
  style,
  className = "",
  offset,
  widthFraction,
  onDragY,
  onDragW,
  canRemove,
  onRemove,
  canAdd,
  isLast,
  onAddAfter,
  onOpenPicker,
}: {
  slot: FontSlot;
  label: string;
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
  canRemove: boolean;
  onRemove: () => void;
  canAdd: boolean;
  isLast: boolean;
  onAddAfter: () => void;
  onOpenPicker?: (role: FontRole, rect: DOMRect) => void;
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

  const CHROME_RESERVE_PX = 320;

  return (
    <div
      ref={containerRef}
      className="group relative flex items-center w-full"
      style={{ transform: `translateY(${offset}px)` }}
    >
      {/* Specimen Column */}
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

        <div
          onMouseDown={handleMouseDownW}
          className="absolute -right-2 top-0 bottom-0 w-4 cursor-ew-resize z-10"
        />

        {/* Hover-revealed "+" between this block and the next — centered to specimen column */}
        {canAdd && !isLast && (
          <div className="pointer-events-none absolute left-0 right-0 -bottom-10 z-30 flex h-8 items-center justify-center translate-y-2">
            <div className="pointer-events-auto opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <button
                onClick={onAddAfter}
                aria-label="Add font"
                title="Add font"
                className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-150 active:scale-95"
                style={{ background: "var(--text)", color: "var(--bg)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.65"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
              >
                <PlusSignIcon size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Remove button — between specimen and drag handle */}
      {canRemove && (
        <div
          className="flex-shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{ paddingLeft: `${HANDLE_GAP}px` }}
        >
          <Tooltip label="Remove font" direction="top">
            <IconButton onClick={onRemove} ariaLabel="Remove font" title="Remove font">
              <Cancel01Icon size={18} />
            </IconButton>
          </Tooltip>
        </div>
      )}

      {/* Y-drag handle */}
      <div className="flex-shrink-0" style={{ paddingLeft: `8px` }}>
        <button
          onMouseDown={handleMouseDownY}
          className="p-2 rounded-lg opacity-0 group-hover:opacity-20 hover:!opacity-100 hover:bg-[var(--surface-muted)] transition-all cursor-pointer active:cursor-grabbing active:scale-95"
          style={{ color: "var(--text)" }}
          title="Drag to reposition"
        >
          <DragDropVerticalIcon size={18} />
        </button>
      </div>

      {/* Flexible spacer pushes info to the right */}
      <div className="flex-1" style={{ minWidth: `${HANDLE_INFO_MIN_GAP}px` }} />

      {/* Font Information */}
      <aside ref={infoRef} className="flex flex-shrink-0 items-center gap-3 text-right">
        <div className="w-[140px]">
          <div
            className="text-[11px] uppercase tracking-[0.16em] opacity-80 truncate"
            style={{ color: "var(--text)" }}
          >
            {label}
          </div>
          <button
            onClick={(e) => onOpenPicker?.(slot.role, e.currentTarget.getBoundingClientRect())}
            className="mt-0.5 truncate text-[14px] font-medium text-left max-w-full -mx-2 px-2 py-0.5 rounded-full transition-all duration-150"
            style={{ fontFamily: cssFamily(slot.family), color: "var(--text)" }}
            title="Choose font"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "color-mix(in oklch, var(--text) 8%, transparent)";
              e.currentTarget.style.boxShadow = "0 0 0 1px color-mix(in oklch, var(--text) 16%, transparent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {slot.family}
          </button>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1.5">
          <CopyButton family={slot.family} role={slot.role} label={label} locked={locked} />
          <LockButton locked={locked} onToggle={onToggleLock} />
        </div>
      </aside>
    </div>
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
      const config = `${role}: ['${family}', 'system-ui', 'sans-serif'],`;
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
