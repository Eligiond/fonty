"use client";

import {
  Heart,
  Copy,
  Check,
  Type,
  ScrollText,
  Rows3,
  Columns3,
  PanelLeft,
} from "lucide-react";

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
};

export default function TopBar({
  tab,
  setTab,
  viewMode,
  setViewMode,
  vibe,
  onSave,
  justSaved,
  onCopy,
  copied,
  sidebarOpen,
  onSidebarToggle,
}: Props) {
  return (
    <div
      className="flex h-12 items-center justify-between border-b px-3"
      style={{
        background: "var(--bg)",
        borderColor: "var(--border)",
        color: "var(--text)",
      }}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={onSidebarToggle}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          className="rounded-md p-1.5 transition-colors hover:bg-[color:var(--surface)]"
          style={{ color: sidebarOpen ? "var(--text)" : "var(--text-muted)" }}
        >
          <PanelLeft className="h-4 w-4" />
        </button>

        <div
          className="mx-1 h-5 w-px"
          style={{ background: "var(--border)" }}
        />

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
              label="Vertical"
            />
            <Pill
              active={viewMode === "horizontal"}
              onClick={() => setViewMode("horizontal")}
              icon={<Columns3 className="h-3.5 w-3.5" />}
              label="Horizontal"
            />
          </SegmentedTabs>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span
          className="hidden rounded-full px-3 py-1 text-[11px] uppercase tracking-widest sm:inline-block"
          style={{
            background: "var(--surface-muted)",
            color: "var(--text-muted)",
          }}
        >
          {vibe}
        </span>

        <ActionButton onClick={onSave} variant="ghost" justActed={justSaved}>
          {justSaved ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Saved
            </>
          ) : (
            <>
              <Heart className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
              Save
            </>
          )}
        </ActionButton>

        <ActionButton onClick={onCopy} variant="solid" justActed={copied}>
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
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-medium transition-colors"
      style={
        active
          ? {
              background: "var(--bg)",
              color: "var(--text)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.06), 0 0 0 1px var(--border)",
            }
          : { color: "var(--text-muted)" }
      }
    >
      {icon}
      {label}
    </button>
  );
}

function ActionButton({
  onClick,
  variant,
  justActed,
  children,
}: {
  onClick: () => void;
  variant: "ghost" | "solid";
  justActed: boolean;
  children: React.ReactNode;
}) {
  const isSolid = variant === "solid";
  return (
    <button
      onClick={onClick}
      className={`group inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-[transform,box-shadow,background-color,color] duration-200 hover:-translate-y-px ${
        justActed ? "fonty-pulse" : ""
      }`}
      style={
        isSolid
          ? {
              background: "var(--accent)",
              color: "var(--accent-text)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.08), 0 0 0 1px var(--accent)",
            }
          : {
              background: "var(--bg)",
              color: "var(--text)",
              boxShadow: "0 0 0 1px var(--border)",
            }
      }
      onMouseEnter={(e) => {
        if (isSolid) {
          e.currentTarget.style.boxShadow =
            "0 4px 12px rgba(0,0,0,0.12), 0 0 0 1px var(--accent)";
        } else {
          e.currentTarget.style.background = "var(--surface)";
          e.currentTarget.style.boxShadow =
            "0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px var(--text)";
        }
      }}
      onMouseLeave={(e) => {
        if (isSolid) {
          e.currentTarget.style.boxShadow =
            "0 1px 2px rgba(0,0,0,0.08), 0 0 0 1px var(--accent)";
        } else {
          e.currentTarget.style.background = "var(--bg)";
          e.currentTarget.style.boxShadow = "0 0 0 1px var(--border)";
        }
      }}
    >
      {children}
    </button>
  );
}
