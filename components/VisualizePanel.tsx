"use client";

import { Cancel01Icon, ArrowUpRight01Icon } from "@hugeicons/react";
import { Tooltip } from "./Tooltip";

export const VISUALIZE_PANEL_WIDTH = 540;

export type VisualizePreview =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "ready"; url: string }
  | { state: "error"; message: string };

type Props = {
  open: boolean;
  preview: VisualizePreview;
  onClose: () => void;
  onElevate: () => void;
};

export default function VisualizePanel({ open, preview, onClose, onElevate }: Props) {
  return (
    <aside
      aria-hidden={!open}
      className="hidden flex-shrink-0 lg:flex flex-col overflow-hidden border-l transition-[width] duration-[350ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
      style={{
        width: open ? VISUALIZE_PANEL_WIDTH : 0,
        color: "var(--text)",
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      <div
        className="relative flex h-full flex-col"
        style={{ width: VISUALIZE_PANEL_WIDTH, minWidth: VISUALIZE_PANEL_WIDTH }}
      >
        {/* Header — buttons sit as real flex items on each edge so the
            Tooltip wrappers have actual bounds; the title is absolutely
            centered on top so it stays perfectly mid-row regardless. */}
        <div
          className="relative flex h-12 items-center justify-between border-b px-3"
          style={{ borderColor: "var(--border)" }}
        >
          <Tooltip label="Open in Export" direction="bottom">
            <button
              onClick={onElevate}
              aria-label="Open in Export"
              disabled={preview.state !== "ready"}
              className="group flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 hover:bg-[color:var(--bg)] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ color: "var(--text)" }}
            >
              <ArrowUpRight01Icon
                size={18}
                className="transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </button>
          </Tooltip>

          <span
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[13px] font-bold tracking-tight"
            style={{ color: "var(--text)" }}
          >
            Visualize fonts
          </span>

          <Tooltip label="Close" direction="bottom">
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 hover:bg-[color:var(--bg)]"
              style={{ color: "var(--text)" }}
            >
              <Cancel01Icon size={18} />
            </button>
          </Tooltip>
        </div>

        {/* Body */}
        <div
          className="flex-1 min-h-0 m-4 rounded-xl border overflow-hidden flex items-center justify-center"
          style={{ background: "var(--bg)", borderColor: "var(--border)" }}
        >
          {(preview.state === "idle" || preview.state === "loading") && (
            <TypesettingLoader />
          )}

          {preview.state === "ready" && (
            <iframe
              title="PDF preview"
              src={`${preview.url}#toolbar=0&navpanes=0`}
              className="w-full h-full"
              style={{ border: "none", background: "#fff" }}
            />
          )}

          {preview.state === "error" && (
            <div className="flex flex-col items-center gap-3 px-6 py-10 text-center max-w-sm">
              <p className="text-[13px] font-bold" style={{ color: "var(--text)" }}>
                Couldn&rsquo;t generate the PDF
              </p>
              <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                {preview.message}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function TypesettingLoader() {
  return (
    <div className="flex flex-col items-center gap-7 px-6 py-10 text-center">
      <div className="flex flex-col items-center gap-5">
        <span
          aria-hidden
          className="fonty-aa-breathe font-heading text-[44px] leading-none select-none"
          style={{ color: "var(--text)" }}
        >
          Aa
        </span>
        <div className="flex flex-col items-start gap-[6px]" style={{ width: 132 }}>
          {[100, 76, 92, 60].map((w, i) => (
            <div
              key={i}
              className="fonty-typeset-line h-[5px] rounded-sm"
              style={{
                width: `${w}%`,
                background: "var(--surface-muted)",
                animationDelay: `${i * 220}ms`,
              }}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <p className="text-[13px] font-bold tracking-tight" style={{ color: "var(--text)" }}>
          Typesetting your specimen
        </p>
        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          Embedding fonts · Laying out pages
        </p>
      </div>
    </div>
  );
}
