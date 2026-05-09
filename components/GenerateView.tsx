"use client";

import { useEffect, useRef, useState } from "react";
import {
  SquareLock02Icon,
  SquareUnlock02Icon,
  Copy01Icon,
  Tick02Icon,
  Cancel01Icon,
  PlusSignIcon,
  DragDropVerticalIcon,
  DragDropHorizontalIcon,
} from "@hugeicons/react";
import { cssFamily, type FontPairing, type FontRole, type FontSlot, MIN_SLOTS, MAX_SLOTS } from "@/lib/fonts";
import EditableText from "@/components/EditableText";
import IconButton from "@/components/IconButton";
import { Tooltip } from "@/components/Tooltip";
import FontPicker from "@/components/FontPicker";
import type { Adjustments } from "@/components/SidePanel";
import type { ViewMode } from "@/components/TopBar";

const ROLE_TAG: Record<FontRole, { tag: string; label: string }> = {
  heading:    { tag: "H1", label: "Heading" },
  subheading: { tag: "H3", label: "Subheading" },
  body:       { tag: "P",  label: "Body" },
  caption:    { tag: "C",  label: "Caption" },
};

const BASE_LINE_HEIGHT: Record<FontRole, number> = {
  heading:    1.05,
  subheading: 1.35,
  body:       1.55,
  caption:    1.4,
};

const VERTICAL_WEIGHT: Record<FontRole, string> = {
  heading:    "600",
  subheading: "500",
  body:       "400",
  caption:    "500",
};

// Stripes are assigned by position rather than role so the gradient stays
// intentional regardless of how the user reorders.
const stripeForIndex = (idx: number): string => {
  if (idx === 0) return "var(--stripe-1)";
  if (idx === 1) return "var(--stripe-2)";
  if (idx === 2) return "var(--stripe-3)";
  return "var(--stripe-4)";
};

export type Texts = Record<FontRole, string>;

type PickerTarget = { role: FontRole; rect: DOMRect };

type Props = {
  pairing: FontPairing;
  locks: Record<FontRole, boolean>;
  onToggleLock: (role: FontRole) => void;
  texts: Texts;
  onTextChange: (role: FontRole, value: string) => void;
  adjustments: Adjustments;
  viewMode: ViewMode;
  onAddSlot: () => void;
  onRemoveSlot: (role: FontRole) => void;
  onReorderSlots: (fromIdx: number, toIdx: number) => void;
  setPanelOpen?: (open: boolean) => void;
  onFontChange?: (role: FontRole, family: string) => void;
};

export default function GenerateView({
  pairing,
  locks,
  onToggleLock,
  texts,
  onTextChange,
  adjustments,
  viewMode,
  onAddSlot,
  onRemoveSlot,
  onReorderSlots,
  setPanelOpen,
  onFontChange,
}: Props) {
  const slots = pairing.slots;
  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);
  const canAdd = slots.length < MAX_SLOTS;
  const canRemove = slots.length > MIN_SLOTS;
  const isHorizontal = viewMode === "horizontal";
  const isVertical = viewMode === "vertical";

  const [lastWidth, setLastWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 0);

  useEffect(() => {
    if (isHorizontal) return;
    
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      // Trigger point: 1200px. If we shrink past it, close the dashboard.
      if (currentWidth < 1200 && lastWidth >= 1200) {
        setPanelOpen?.(false);
      }
      setLastWidth(currentWidth);
    };

    window.addEventListener("resize", handleResize);
    // Initial check
    if (window.innerWidth < 1200) {
      setPanelOpen?.(false);
    }
    
    return () => window.removeEventListener("resize", handleResize);
  }, [isHorizontal, setPanelOpen, lastWidth]);

  // Reorder via mouse drag — works for both views by hit-testing slot containers.
  const dragState = useRef<{ fromIdx: number; currentIdx: number } | null>(null);

  const startReorder = (fromIdx: number, axis: "y" | "x") => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragState.current = { fromIdx, currentIdx: fromIdx };

    document.body.style.cursor = axis === "y" ? "grabbing" : "grabbing";
    document.body.style.userSelect = "none";

    const onMove = (ev: MouseEvent) => {
      const elements = document.querySelectorAll<HTMLElement>("[data-slot-idx]");
      let target = dragState.current!.currentIdx;
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        const rect = el.getBoundingClientRect();
        const inside =
          axis === "y"
            ? ev.clientY >= rect.top && ev.clientY <= rect.bottom
            : ev.clientX >= rect.left && ev.clientX <= rect.right;
        if (inside) {
          target = Number(el.dataset.slotIdx);
          break;
        }
      }
      if (target !== dragState.current!.currentIdx) {
        onReorderSlots(dragState.current!.currentIdx, target);
        dragState.current = { ...dragState.current!, currentIdx: target };
      }
    };

    const onUp = () => {
      dragState.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const openPicker = (role: FontRole, rect: DOMRect) => setPickerTarget({ role, rect });
  const closePicker = () => setPickerTarget(null);

  const picker = pickerTarget && onFontChange ? (
    <FontPicker
      currentFamily={pairing.slots.find((s) => s.role === pickerTarget.role)?.family ?? ""}
      anchorRect={pickerTarget.rect}
      onSelect={(family) => onFontChange(pickerTarget.role, family)}
      onClose={closePicker}
    />
  ) : null;

  if (isHorizontal) {
    return (
      <>
        <div
          className="grid h-full pt-8"
          style={{
            gridTemplateRows: slots.length > 0
              ? `1.15fr repeat(${slots.length - 1}, 1fr)`
              : "none"
          }}
        >
          {slots.map((slot, idx) => (
            <Stripe
              key={slot.role}
              slot={slot}
              idx={idx}
              locked={locks[slot.role]}
              text={texts[slot.role]}
              adj={adjustments[slot.role]}
              canRemove={canRemove}
              canAdd={canAdd}
              isLast={idx === slots.length - 1}
              onTextChange={(v) => onTextChange(slot.role, v)}
              onToggleLock={() => onToggleLock(slot.role)}
              onRemove={() => onRemoveSlot(slot.role)}
              onAddAfter={onAddSlot}
              onStartReorder={startReorder(idx, "y")}
              onOpenPicker={onFontChange ? openPicker : undefined}
            />
          ))}
        </div>
        {picker}
      </>
    );
  }

  return (
    <>
      <div
        className="grid h-full overflow-x-auto"
        style={{ gridTemplateColumns: `repeat(${slots.length}, minmax(280px, 1fr))` }}
      >
        {slots.map((slot, idx) => (
          <Column
            key={slot.role}
            slot={slot}
            idx={idx}
            locked={locks[slot.role]}
            text={texts[slot.role]}
            adj={adjustments[slot.role]}
            canRemove={canRemove}
            canAdd={canAdd}
            isLast={idx === slots.length - 1}
            onTextChange={(v) => onTextChange(slot.role, v)}
            onToggleLock={() => onToggleLock(slot.role)}
            onRemove={() => onRemoveSlot(slot.role)}
            onAddAfter={onAddSlot}
            onStartReorder={startReorder(idx, "x")}
            onOpenPicker={onFontChange ? openPicker : undefined}
          />
        ))}
      </div>
      {picker}
    </>
  );
}

function buildStyle(
  family: string,
  role: FontRole,
  adj: { fontSize: number; lineHeight: number; letterSpacing: number },
  fontWeight: string,
): React.CSSProperties {
  return {
    fontFamily: cssFamily(family),
    fontSize: `${adj.fontSize}px`,
    lineHeight: BASE_LINE_HEIGHT[role] * adj.lineHeight,
    letterSpacing: `${adj.letterSpacing}em`,
    fontWeight,
  };
}

/* ────────────────────────────────────────────────────────────
   Vertical view — Stripe (one row per slot)
   ──────────────────────────────────────────────────────────── */

function Stripe({
  slot,
  idx,
  locked,
  text,
  adj,
  canRemove,
  canAdd,
  isLast,
  onTextChange,
  onToggleLock,
  onRemove,
  onAddAfter,
  onStartReorder,
  onOpenPicker,
}: {
  slot: FontSlot;
  idx: number;
  locked: boolean;
  text: string;
  adj: { fontSize: number; lineHeight: number; letterSpacing: number };
  canRemove: boolean;
  canAdd: boolean;
  isLast: boolean;
  onTextChange: (v: string) => void;
  onToggleLock: () => void;
  onRemove: () => void;
  onAddAfter: () => void;
  onStartReorder: (e: React.MouseEvent) => void;
  onOpenPicker?: (role: FontRole, rect: DOMRect) => void;
}) {
  const meta = ROLE_TAG[slot.role];
  return (
    <section
      data-slot-idx={idx}
      className="group relative flex items-center gap-4 px-6 md:px-10 transition-colors duration-500"
      style={{
        background: locked
          ? `color-mix(in oklch, var(--accent) 4%, ${stripeForIndex(idx)})`
          : stripeForIndex(idx),
        color: "var(--text)",
      }}
    >
      <div className="min-w-0 flex-1">
        <EditableText
          value={text}
          onChange={onTextChange}
          ariaLabel={`Edit ${meta.label.toLowerCase()} sample`}
          className="overflow-hidden break-words"
          style={buildStyle(slot.family, slot.role, adj, VERTICAL_WEIGHT[slot.role])}
        />
      </div>

      <SlotActionStack
        orientation="vertical"
        canRemove={canRemove}
        onRemove={onRemove}
        onStartReorder={onStartReorder}
      />

      <aside className="flex flex-shrink-0 items-center gap-3 text-right">
        <div className="w-[140px]">
          <div
            className="text-[13px] uppercase tracking-[0.16em] opacity-80 truncate"
            style={{ color: "var(--text)" }}
          >
            {meta.tag} · {meta.label}
          </div>
          <button
            onClick={(e) => onOpenPicker?.(slot.role, e.currentTarget.getBoundingClientRect())}
            className="font-pick-btn mt-0.5 truncate text-[14px] font-medium text-left max-w-full -mx-2 px-2 py-0.5 rounded-full"
            style={{ fontFamily: cssFamily(slot.family), color: "var(--text)" }}
            title="Choose font"
          >
            {slot.family}
          </button>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1.5">
          <CopyButton family={slot.family} role={slot.role} />
          <LockButton locked={locked} onToggle={onToggleLock} />
        </div>
      </aside>

      {canAdd && !isLast && (
        <BoundaryAdd orientation="horizontal" onAdd={onAddAfter} />
      )}
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   Horizontal view — Column (one column per slot)
   ──────────────────────────────────────────────────────────── */

function Column({
  slot,
  idx,
  locked,
  text,
  adj,
  canRemove,
  canAdd,
  isLast,
  onTextChange,
  onToggleLock,
  onRemove,
  onAddAfter,
  onStartReorder,
  onOpenPicker,
}: {
  slot: FontSlot;
  idx: number;
  locked: boolean;
  text: string;
  adj: { fontSize: number; lineHeight: number; letterSpacing: number };
  canRemove: boolean;
  canAdd: boolean;
  isLast: boolean;
  onTextChange: (v: string) => void;
  onToggleLock: () => void;
  onRemove: () => void;
  onAddAfter: () => void;
  onStartReorder: (e: React.MouseEvent) => void;
  onOpenPicker?: (role: FontRole, rect: DOMRect) => void;
}) {
  const meta = ROLE_TAG[slot.role];
  return (
    <section
      data-slot-idx={idx}
      className="group relative flex h-full flex-col justify-between border-r px-4 pb-12 pt-32 last:border-r-0 md:px-8 md:pb-16 md:pt-32 transition-colors duration-500"
      style={{
        background: locked
          ? `color-mix(in oklch, var(--accent) 4%, ${stripeForIndex(idx)})`
          : stripeForIndex(idx),
        color: "var(--text)",
        borderColor: "var(--border)",
      }}
    >
      <header className="flex items-start justify-between gap-3">
        <div
          className="text-[13px] uppercase tracking-[0.16em] opacity-80"
          style={{ color: "var(--text)" }}
        >
          {meta.tag} · {meta.label}
        </div>
        <div className="flex flex-shrink-0 items-center gap-1.5">
          <CopyButton family={slot.family} role={slot.role} />
          <LockButton locked={locked} onToggle={onToggleLock} />
        </div>
      </header>

      <div className="relative flex flex-1 items-center py-6">
        <EditableText
          value={text}
          onChange={onTextChange}
          ariaLabel={`Edit ${meta.label.toLowerCase()} sample`}
          multiline
          className="min-w-0 overflow-wrap-anywhere break-words"
          style={buildStyle(slot.family, slot.role, adj, VERTICAL_WEIGHT[slot.role])}
        />
      </div>

      <footer>
        <button
          onClick={(e) => onOpenPicker?.(slot.role, e.currentTarget.getBoundingClientRect())}
          className="font-pick-btn truncate text-[13px] font-medium max-w-full text-left -mx-3 px-3 py-1.5 rounded-full"
          style={{ fontFamily: cssFamily(slot.family), color: "var(--text)" }}
          title="Choose font"
        >
          {slot.family}
        </button>
      </footer>

      {/* Action stack — below header, above text center */}
      <div className="pointer-events-none absolute left-0 right-0 top-44 flex justify-center">
        <SlotActionStack
          orientation="vertical"
          canRemove={canRemove}
          onRemove={onRemove}
          onStartReorder={onStartReorder}
        />
      </div>
      {canAdd && !isLast && (
        <BoundaryAdd orientation="vertical" onAdd={onAddAfter} />
      )}
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   Per-slot hover-revealed action stack (X + drag).
   Both views use a vertical stack — matches the coolors layout.
   ──────────────────────────────────────────────────────────── */

function SlotActionStack({
  canRemove,
  onRemove,
  onStartReorder,
  orientation,
}: {
  canRemove: boolean;
  onRemove: () => void;
  onStartReorder: (e: React.MouseEvent) => void;
  orientation: "vertical" | "horizontal";
}) {
  const isVertical = orientation === "vertical";
  return (
    <div
      className={`pointer-events-auto flex ${isVertical ? "flex-col" : "flex-row"} items-center gap-1.5 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 focus-within:opacity-100`}
    >
      {canRemove && (
        <Tooltip label="Remove font" direction={isVertical ? "left" : "top"}>
          <IconButton onClick={onRemove} ariaLabel="Remove font" title="Remove font">
            <Cancel01Icon size={18} />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip label="Drag to reorder" direction={isVertical ? "left" : "top"}>
        <button
          type="button"
          onMouseDown={onStartReorder}
          aria-label="Drag to reorder"
          title="Drag to reorder"
          className="group/drag relative inline-flex h-8 w-8 flex-shrink-0 cursor-grab items-center justify-center rounded-full transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] active:cursor-grabbing active:scale-[0.92] bg-transparent text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
        >
          <span className="relative z-10 transition-transform duration-200 group-hover/drag:scale-110">
            {isVertical ? <DragDropVerticalIcon size={18} /> : <DragDropHorizontalIcon size={18} />}
          </span>
        </button>
      </Tooltip>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Hover-revealed "+" between slots (coolors-style).
   - orientation="horizontal" → for vertical view (between rows): horizontal hover strip
   - orientation="vertical"   → for horizontal view (between cols): vertical hover strip
   ──────────────────────────────────────────────────────────── */

function AddButton({ onAdd }: { onAdd: () => void }) {
  return (
    <button
      onClick={onAdd}
      aria-label="Add font"
      title="Add font"
      className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-150 active:scale-95"
      style={{ background: "var(--text)", color: "var(--bg)" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.65"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
    >
      <PlusSignIcon size={18} />
    </button>
  );
}

function BoundaryAdd({
  orientation,
  onAdd,
}: {
  orientation: "horizontal" | "vertical";
  onAdd: () => void;
}) {
  if (orientation === "horizontal") {
    return (
      <div className="pointer-events-none absolute -bottom-2 left-6 right-[294px] md:left-10 md:right-[310px] z-30 flex h-4 items-center justify-center">
        <div className="pointer-events-auto opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <AddButton onAdd={onAdd} />
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute right-0 translate-x-1/2 inset-y-0 z-30 flex w-7 items-center justify-center">
      <div className="pointer-events-auto opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <AddButton onAdd={onAdd} />
      </div>
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
}: {
  family: string;
  role: FontRole;
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
