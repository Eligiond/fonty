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
};

export default function TopBar({
  viewMode,
  setViewMode,
  isDark,
  onSave,
  justSaved,
  onCopy,
  copied,
  activeColor,
}: Props) {
  return (
    <div
      className="flex h-16 items-center justify-between px-8 relative"
      style={{
        color: "var(--text)",
      }}
    >
      {/* Left Group - Instruction hint */}
      <div className="flex-1 flex items-center justify-start h-full">
        <button 
          onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }))}
          className="group flex items-center gap-1.5 text-[13px] font-medium select-none"
          style={{ color: "var(--text-muted)" }}
        >
          <span className={`${isDark ? "opacity-80" : "opacity-60"} group-hover:opacity-100 transition-opacity duration-300`}>
            Press
          </span>
          <span 
            className="inline-flex items-center justify-center px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--surface-muted)] text-[10px] font-bold shadow-sm transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:scale-110 hover:bg-[var(--surface)] hover:text-[var(--text)] hover:shadow-md active:scale-95"
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
          <Tooltip label="Vertical view" direction="bottom">
            <Pill
              active={viewMode === "vertical"}
              onClick={() => setViewMode("vertical")}
              icon={<Layout3RowIcon size={18} />}
            />
          </Tooltip>
          <Tooltip label="Horizontal view" direction="bottom">
            <Pill
              active={viewMode === "horizontal"}
              onClick={() => setViewMode("horizontal")}
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
      className={`group relative inline-flex items-center justify-center rounded-full w-8 h-8 transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.92]`}
      style={{
        background: active ? "var(--bg)" : "transparent",
        color: active ? "var(--text)" : "var(--text-muted)",
        boxShadow: active 
          ? "0 1px 2px rgba(0,0,0,0.1), 0 0 0 1px var(--border)" 
          : "none",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = "var(--surface-muted)";
          e.currentTarget.style.color = "var(--text)";
          e.currentTarget.style.boxShadow = "inset 0 0 0 1px rgba(255,255,255,0.05)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--text-muted)";
        }
      }}
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
    ? (customColor ?? "var(--text)") 
    : "var(--bg)";
  
  const text = isSolid 
    ? (customColor ? getContrastText(customColor) : "var(--bg)") 
    : "var(--text)";

  return (
    <button
      onClick={onClick}
      className={`group inline-flex items-center gap-2 rounded-full px-4 h-8 text-[12px] font-bold transition-all duration-200 hover:-translate-y-px active:scale-[0.97] ${
        justActed ? "fonty-pulse" : ""
      } ${className}`}
      style={
        isSolid
          ? {
              background: bg,
              color: text,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }
          : {
              background: bg,
              color: text,
              boxShadow: "0 0 0 1px var(--border)",
            }
      }
      onMouseEnter={(e) => {
        if (isSolid) {
          e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.15)";
          e.currentTarget.style.opacity = "0.9";
        } else {
          e.currentTarget.style.background = "var(--surface)";
        }
      }}
      onMouseLeave={(e) => {
        if (isSolid) {
          e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
          e.currentTarget.style.opacity = "1";
        } else {
          e.currentTarget.style.background = "var(--bg)";
        }
      }}
    >
      {children}
    </button>
  );
}
