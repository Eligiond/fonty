"use client";

import {
  Bookmark02Icon,
  Copy01Icon,
  Tick02Icon,
  Layout3RowIcon,
  Layout3ColumnIcon,
  ScrollIcon,
} from "@hugeicons/react";
import { getContrastText } from "@/lib/colors";
import { Tooltip } from "./Tooltip";

export type ViewMode = "vertical" | "horizontal" | "scroll";

type Props = {
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  vibe: string;
  isDark?: boolean;
  onSave: () => void;
  justSaved: boolean;
  onCopy: () => void;
  copied: boolean;
  activeColor?: string | null;
  onRoll?: () => void;
};

export default function TopBar({
  viewMode,
  setViewMode,
  vibe,
  isDark,
  onSave,
  justSaved,
  onCopy,
  copied,
  activeColor,
  onRoll,
}: Props) {
  return (
    <div
      className="flex h-16 items-center justify-between px-10 relative"
      style={{
        color: "var(--text)",
      }}
    >
      {/* Left Group - Instruction hint */}
      <div className="flex-1 flex items-center justify-start h-full">
        <button 
          onClick={onRoll}
          tabIndex={-1}
          className="group flex items-center gap-1.5 text-[12px] font-bold select-none outline-none"
          style={{ color: "var(--text-muted)" }}
        >
          <span className={`${isDark ? "opacity-80" : "opacity-60"} group-hover:opacity-100 transition-opacity duration-300`}>
            Press
          </span>
          <span 
            className="inline-flex items-center justify-center px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--surface-muted)] text-[12px] font-bold shadow-sm transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110 group-hover:bg-[var(--surface)] group-hover:text-[var(--text)] group-hover:shadow-md group-active:scale-95"
          >
            SPACEBAR
          </span>
          <span className={`${isDark ? "opacity-80" : "opacity-60"} group-hover:opacity-100 transition-opacity duration-300`}>
            to generate font pairs
          </span>
        </button>
      </div>

      {/* Center Group - View Toggle centered */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <SegmentedTabs>
          <Tooltip label="Horizontal view" direction="bottom">
            <Pill
              active={viewMode === "horizontal"}
              onClick={() => setViewMode("horizontal")}
              icon={<Layout3RowIcon size={18} />}
            />
          </Tooltip>
          <Tooltip label="Vertical view" direction="bottom">
            <Pill
              active={viewMode === "vertical"}
              onClick={() => setViewMode("vertical")}
              icon={<Layout3ColumnIcon size={18} />}
            />
          </Tooltip>
          <Tooltip label="Website view" direction="bottom">
            <Pill
              active={viewMode === "scroll"}
              onClick={() => setViewMode("scroll")}
              icon={<ScrollIcon size={18} />}
            />
          </Tooltip>
        </SegmentedTabs>
      </div>

      {/* Right Group - Save (Ghost) and Copy (Solid) */}
      <div className="flex-1 flex items-center justify-end gap-3 h-full">
        <Tooltip label="Save pairing" shortcut="s" direction="bottom">
          <ActionButton onClick={onSave} variant="ghost" justActed={justSaved}>
            {justSaved ? (
              <>
                <Tick02Icon size={18} />
                Saved
              </>
            ) : (
              <>
                <Bookmark02Icon
                  size={18}
                  className="transition-transform group-hover:scale-110"
                />
                Save
              </>
            )}
          </ActionButton>
        </Tooltip>
        <Tooltip label="Copy config" direction="bottom">
          <ActionButton
            onClick={onCopy}
            variant="solid"
            justActed={copied}
            customColor={activeColor}
          >
            {copied ? (
              <>
                <Tick02Icon size={18} />
                Copied
              </>
            ) : (
              <>
                <Copy01Icon
                  size={18}
                  className="transition-transform group-hover:-rotate-6"
                />
                Copy config
              </>
            )}
          </ActionButton>
        </Tooltip>
      </div>
    </div>
  );
}

function SegmentedTabs({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      {children}
    </div>
  );
}

function Pill({
  active,
  onClick,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative inline-flex items-center justify-center rounded-full w-8 h-8 transition-[background-color,color,transform,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.92] ${
        active 
          ? "bg-[var(--bg)] text-[var(--text)] shadow-[0_1px_2px_rgba(0,0,0,0.1),0_0_0_1px_var(--border)]" 
          : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
      }`}
    >
      <div className="relative z-10 transition-transform duration-200 group-hover:scale-110">
        {icon}
      </div>
    </button>
  );
}

function ActionButton({
  onClick,
  variant,
  justActed,
  children,
  customColor,
  className = "",
}: {
  onClick: () => void;
  variant: "ghost" | "solid";
  justActed: boolean;
  children: React.ReactNode;
  customColor?: string | null;
  className?: string;
}) {
  const isSolid = variant === "solid";

  const bg = isSolid 
    ? (customColor || "var(--text)") 
    : "var(--bg)";

  const text = isSolid 
    ? (customColor ? getContrastText(customColor) : "var(--bg)") 
    : "var(--text)";

  return (
    <button
      onClick={onClick}
      className={`group inline-flex items-center gap-2 rounded-full px-4 h-8 text-[12px] font-bold transition-[transform,box-shadow,background-color,opacity] duration-200 hover:-translate-y-px active:scale-[0.97] ${
        justActed ? "fonty-pulse" : ""
      } ${
        isSolid 
          ? "hover:opacity-90 hover:shadow-[0_6px_12px_rgba(0,0,0,0.15)] shadow-[0_2px_4px_rgba(0,0,0,0.1)]" 
          : "hover:bg-[var(--surface)] shadow-[0_0_0_1px_var(--border)]"
      } ${className}`}
      style={{
        background: bg,
        color: text,
      }}
    >
      {children}
    </button>
  );
}
