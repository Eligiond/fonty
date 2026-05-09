"use client";

import { forwardRef, useState } from "react";
import {
  Bookmark02Icon,
  Copy01Icon,
  Tick02Icon,
  Layout3RowIcon,
  Layout3ColumnIcon,
  ScrollIcon,
  ArrowTurnBackwardIcon,
  ArrowTurnForwardIcon,
  SlidersHorizontalIcon,
  Hamburger02Icon,
  Upload01Icon,
} from "@hugeicons/react";
import { getContrastText } from "@/lib/colors";
import { Tooltip } from "./Tooltip";
import ExportMenu from "./ExportMenu";
import type { FontPairing } from "@/lib/fonts";
import type { Texts } from "./GenerateView";

export type ViewMode = "vertical" | "horizontal" | "scroll";

type Props = {
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  vibe: string;
  isDark?: boolean;

  // Primary actions
  onSave: () => void;
  justSaved: boolean;
  onCopy: () => void;
  copied: boolean;
  activeColor?: string | null;

  // History
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Side panel openers
  onOpenAdjust: () => void;
  onOpenDashboard: () => void;
  panelOpen: boolean;
  panelTab: "saved" | "adjust";

  // Roll (used by spacebar hint)
  onRoll?: () => void;

  // Export payload
  pairing: FontPairing;
  texts: Texts;
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
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onOpenAdjust,
  onOpenDashboard,
  panelOpen,
  panelTab,
  onRoll,
  pairing,
  texts,
}: Props) {
  const [exportOpen, setExportOpen] = useState(false);

  const adjustActive = panelOpen && panelTab === "adjust";
  const dashboardActive = panelOpen;

  return (
    <div
      className="flex h-16 items-center justify-between px-6 relative border-b"
      style={{
        color: "var(--text)",
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      {/* LEFT — spacebar hint */}
      <div className="flex items-center justify-start h-full">
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

      {/* RIGHT — sections separated by | */}
      <div className="flex items-center gap-2">
        {/* Section 1a — View toggle */}
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />

        <Divider />

        {/* Section 1b — Adjust */}
        <Tooltip label={adjustActive ? "Close adjust" : "Adjust typography"} direction="bottom">
          <IconButton
            active={adjustActive}
            onClick={onOpenAdjust}
            aria-label="Adjust"
            icon={<SlidersHorizontalIcon size={18} />}
          />
        </Tooltip>

        <Divider />

        {/* Section 2 — Undo / Redo */}
        <div className="flex items-center gap-0.5">
          <Tooltip label="Step back" direction="bottom">
            <IconButton
              onClick={onUndo}
              disabled={!canUndo}
              aria-label="Undo"
              icon={
                <ArrowTurnBackwardIcon
                  size={18}
                  className="transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:-translate-x-0.5"
                />
              }
            />
          </Tooltip>
          <Tooltip label="Step forward" direction="bottom">
            <IconButton
              onClick={onRedo}
              disabled={!canRedo}
              aria-label="Redo"
              icon={
                <ArrowTurnForwardIcon
                  size={18}
                  className="transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-0.5"
                />
              }
            />
          </Tooltip>
        </div>

        <Divider />

        {/* Section 3 — Save / Export / Copy */}
        <div className="flex items-center gap-1.5">
          <Tooltip label="Save pairing" shortcut="s" direction="bottom">
            <ActionButton onClick={onSave} variant="ghost" justActed={justSaved}>
              {justSaved ? (
                <>
                  <Tick02Icon size={16} />
                  Saved
                </>
              ) : (
                <>
                  <Bookmark02Icon
                    size={16}
                    className="transition-transform group-hover:scale-110"
                  />
                  Save
                </>
              )}
            </ActionButton>
          </Tooltip>

          <Tooltip label="Export" direction="bottom">
            <ActionButton
              onClick={() => setExportOpen(true)}
              variant="solid"
              justActed={false}
              active={exportOpen}
              customColor={activeColor}
            >
              <Upload01Icon
                size={16}
                className="transition-transform group-hover:-translate-y-0.5"
              />
              Export
            </ActionButton>
          </Tooltip>

          <Tooltip label="Copy config" direction="bottom">
            <ActionButton
              onClick={onCopy}
              variant="ghost"
              justActed={copied}
            >
              {copied ? (
                <>
                  <Tick02Icon size={16} />
                  Copied
                </>
              ) : (
                <>
                  <Copy01Icon
                    size={16}
                    className="transition-transform group-hover:-rotate-6"
                  />
                  Copy
                </>
              )}
            </ActionButton>
          </Tooltip>
        </div>

        <Divider />

        {/* Section 4 — Dashboard */}
        <Tooltip label={dashboardActive ? "Close dashboard" : "Open dashboard"} direction="bottom">
          <IconButton
            active={dashboardActive}
            onClick={onOpenDashboard}
            aria-label="Dashboard"
            icon={
              <Hamburger02Icon
                size={20}
                className="transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:rotate-90"
              />
            }
          />
        </Tooltip>
      </div>

      <ExportMenu
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        pairing={pairing}
        texts={texts}
        accentColor={activeColor ?? null}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Pieces
   ──────────────────────────────────────────────────────────── */

function Divider() {
  return (
    <span
      aria-hidden
      className="mx-1.5 h-5 w-px"
      style={{ background: "var(--border)", opacity: 0.7 }}
    />
  );
}

function ViewToggle({
  viewMode,
  setViewMode,
}: {
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      <Tooltip label="Horizontal view" direction="bottom">
        <ViewPill
          active={viewMode === "horizontal"}
          onClick={() => setViewMode("horizontal")}
          icon={<Layout3RowIcon size={18} />}
          aria-label="Horizontal view"
        />
      </Tooltip>
      <Tooltip label="Vertical view" direction="bottom">
        <ViewPill
          active={viewMode === "vertical"}
          onClick={() => setViewMode("vertical")}
          icon={<Layout3ColumnIcon size={18} />}
          aria-label="Vertical view"
        />
      </Tooltip>
      <Tooltip label="Website view" direction="bottom">
        <ViewPill
          active={viewMode === "scroll"}
          onClick={() => setViewMode("scroll")}
          icon={<ScrollIcon size={18} />}
          aria-label="Website view"
        />
      </Tooltip>
    </div>
  );
}

function ViewPill({
  active,
  onClick,
  icon,
  ...rest
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  "aria-label"?: string;
}) {
  return (
    <button
      onClick={onClick}
      {...rest}
      className={`group inline-flex h-9 w-9 items-center justify-center rounded-lg transition-[background-color,color,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        active
          ? "bg-[var(--bg)] text-[var(--text)] shadow-[0_1px_2px_rgba(0,0,0,0.08),inset_0_0_0_1px_var(--border)]"
          : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
      }`}
    >
      <span className="transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110">
        {icon}
      </span>
    </button>
  );
}

function IconButton({
  onClick,
  icon,
  active,
  disabled,
  ...rest
}: {
  onClick: () => void;
  icon: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      {...rest}
      className={`group inline-flex h-9 w-9 items-center justify-center rounded-lg transition-[background-color,color,box-shadow,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        disabled
          ? "opacity-30 cursor-not-allowed text-[var(--text-muted)]"
          : active
            ? "bg-[var(--bg)] text-[var(--text)] shadow-[0_1px_2px_rgba(0,0,0,0.08),inset_0_0_0_1px_var(--border)]"
            : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
      }`}
    >
      {icon}
    </button>
  );
}

type ActionButtonProps = {
  onClick: () => void;
  variant: "ghost" | "solid";
  justActed: boolean;
  children: React.ReactNode;
  customColor?: string | null;
  active?: boolean;
  className?: string;
};

const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(function ActionButton(
  { onClick, variant, justActed, children, customColor, active, className = "" },
  ref,
) {
  const isSolid = variant === "solid";

  const bg = isSolid ? (customColor || "var(--text)") : "var(--bg)";
  const text = isSolid
    ? (customColor ? getContrastText(customColor) : "var(--bg)")
    : "var(--text)";

  return (
    <button
      ref={ref}
      onClick={onClick}
      className={`group inline-flex items-center gap-1.5 rounded-lg px-3.5 h-9 text-[12.5px] font-bold tracking-tight transition-[transform,box-shadow,background-color,opacity] duration-200 hover:-translate-y-px ${
        justActed ? "fonty-pulse" : ""
      } ${
        isSolid
          ? "hover:opacity-90 hover:shadow-[0_6px_12px_rgba(0,0,0,0.15)] shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
          : `hover:bg-[var(--surface)] shadow-[inset_0_0_0_1px_var(--border)] ${active ? "bg-[var(--surface-muted)]" : ""}`
      } ${className}`}
      style={{
        background: bg,
        color: text,
      }}
    >
      {children}
    </button>
  );
});
