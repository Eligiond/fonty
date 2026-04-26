"use client";

import {
  Bookmark,
  Copy,
  Check,
  Type,
  ScrollText,
  Rows3,
  Columns3,
} from "lucide-react";
import { getContrastText } from "@/lib/colors";

export type Tab = "generate" | "scroll";
export type ViewMode = "vertical" | "horizontal";

type Props = {
  tab: Tab;
  setTab: (t: Tab) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  vibe: string;
  onSave: () => void;
  justSaved: boolean;
  onCopy: () => void;
  copied: boolean;
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
  controlsOpen: boolean;
  onControlsToggle: () => void;
  activeColor: string | null;
};

export default function TopBar({
  tab,
  setTab,
  viewMode,
  setViewMode,
  onSave,
  justSaved,
  onCopy,
  copied,
  activeColor,
}: Props) {
  return (
    <div
      className="flex h-12 items-center justify-between px-6 relative border-b"
      style={{
        background: "var(--bg)",
        borderColor: "var(--border)",
        color: "var(--text)",
      }}
    >
      {/* Left Group - Save button (Bookmark) */}
      <div className="flex-1 flex items-center justify-start">
        <ActionButton onClick={onSave} variant="ghost" justActed={justSaved}>
          {justSaved ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Saved
            </>
          ) : (
            <>
              <Bookmark className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
              Save
            </>
          )}
        </ActionButton>
      </div>

      {/* Center Group - Generate and Scroll perfectly centered */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3">
        <SegmentedTabs>
          <Pill
            active={tab === "generate"}
            onClick={() => setTab("generate")}
            icon={<Type className="h-3.5 w-3.5" />}
            label="Generate"
          />
          <Pill
            active={tab === "scroll"}
            onClick={() => setTab("scroll")}
            icon={<ScrollText className="h-3.5 w-3.5" />}
            label="Scroll"
          />
        </SegmentedTabs>

        {tab === "generate" && (
          <SegmentedTabs>
            <Pill
              active={viewMode === "vertical"}
              onClick={() => setViewMode("vertical")}
              icon={<Rows3 className="h-3.5 w-3.5" />}
            />
            <Pill
              active={viewMode === "horizontal"}
              onClick={() => setViewMode("horizontal")}
              icon={<Columns3 className="h-3.5 w-3.5" />}
            />
          </SegmentedTabs>
        )}
      </div>

      {/* Right Group - Copy Config moved here for symmetry */}
      <div className="flex-1 flex items-center justify-end">
        <ActionButton onClick={onCopy} variant="solid" justActed={copied} accentColor={activeColor}>
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 transition-transform group-hover:-rotate-6" />
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
    <div
      className="flex items-center gap-0.5 rounded-full p-0.5"
      style={{ background: "var(--surface-muted)" }}
    >
      {children}
    </div>
  );
}

function Pill({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full ${label ? "px-4 py-1.5" : "p-2"} text-[13px] font-semibold transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-95 ${
        active
          ? ""
          : "text-[color:var(--text-muted)] hover:text-[color:var(--text)] hover:bg-[color:var(--surface)]"
      }`}
      style={
        active
          ? {
              background: "var(--bg)",
              color: "var(--text)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.06), 0 0 0 1px var(--border)",
            }
          : undefined
      }
    >
      {icon}
      {label && label}
    </button>
  );
}

function ActionButton({
  onClick,
  variant,
  justActed,
  accentColor,
  children,
}: {
  onClick: () => void;
  variant: "ghost" | "solid";
  justActed: boolean;
  accentColor?: string | null;
  children: React.ReactNode;
}) {
  const isSolid = variant === "solid";
  const solidBg = accentColor ?? "var(--accent)";
  const solidText = accentColor ? getContrastText(accentColor) : "var(--accent-text)";
  return (
    <button
      onClick={onClick}
      className={`group inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold transition-[background-color,color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-px active:scale-95 ${
        justActed ? "fonty-pulse" : ""
      }`}
      style={
        isSolid
          ? {
              background: solidBg,
              color: solidText,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }
          : {
              background: "var(--bg)",
              color: "var(--text)",
              boxShadow: "0 0 0 1px var(--border)",
            }
      }
      onMouseEnter={(e) => {
        if (isSolid) {
          e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.15)";
        } else {
          e.currentTarget.style.background = "var(--surface)";
        }
      }}
      onMouseLeave={(e) => {
        if (isSolid) {
          e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
        } else {
          e.currentTarget.style.background = "var(--bg)";
        }
      }}
    >
      {children}
    </button>
  );
}
