"use client";

import { useEffect, useState } from "react";
import {
  Cancel01Icon,
  Pdf02Icon,
  Link04Icon,
  CodeIcon,
  DocumentCodeIcon,
  SecondBracketIcon,
  Html5Icon,
  Tick02Icon,
  ArrowLeft01Icon,
  Download01Icon,
} from "@hugeicons/react";
import type { FontPairing, FontRole } from "@/lib/fonts";
import { cssFamily } from "@/lib/fonts";
import {
  buildShareUrl,
  buildCssSnippet,
  buildJsonExport,
  buildTailwindConfig,
  buildHtmlExport,
} from "@/lib/share";
import { generateSpecimenPdf, downloadBlob } from "@/lib/pdf";
import type { Texts } from "./GenerateView";

type Props = {
  open: boolean;
  onClose: () => void;
  pairing: FontPairing;
  texts: Texts;
  accentColor?: string | null;
  /** When provided, opens directly at the PDF preview using the cached blob. */
  initialPdfPreview?: { blob: Blob; filename: string } | null;
};

type ExportKey = "pdf" | "url" | "html" | "css" | "tailwind" | "json";

const ITEMS: {
  key: ExportKey;
  label: string;
  hint: string;
  Icon: typeof Pdf02Icon;
}[] = [
  { key: "pdf",      label: "PDF",      hint: "Specimen sheet",       Icon: Pdf02Icon },
  { key: "url",      label: "URL",      hint: "Shareable link",       Icon: Link04Icon },
  { key: "html",     label: "HTML",     hint: "Standalone page",      Icon: Html5Icon },
  { key: "css",      label: "CSS",      hint: "@import + variables",  Icon: CodeIcon },
  { key: "tailwind", label: "Tailwind", hint: "tailwind.config.ts",   Icon: DocumentCodeIcon },
  { key: "json",     label: "JSON",     hint: "Pairing object",       Icon: SecondBracketIcon },
];

const TITLE_ROLE_PRIORITY: FontRole[] = ["heading", "subheading", "body", "caption"];

type PdfPreview =
  | { state: "loading" }
  | { state: "ready"; url: string; blob: Blob; filename: string }
  | { state: "error"; message: string };

export default function ExportMenu({ open, onClose, pairing, texts, accentColor, initialPdfPreview }: Props) {
  const [confirmed, setConfirmed] = useState<ExportKey | null>(null);
  const [busy, setBusy] = useState<ExportKey | null>(null);
  const [pdfPreview, setPdfPreview] = useState<PdfPreview | null>(null);

  // Revoke any object URL when the preview is cleared or modal closes.
  useEffect(() => {
    return () => {
      if (pdfPreview?.state === "ready") URL.revokeObjectURL(pdfPreview.url);
    };
  }, [pdfPreview]);

  // When opened with a cached preview, jump straight to the ready state.
  useEffect(() => {
    if (!open || !initialPdfPreview) return;
    const url = URL.createObjectURL(initialPdfPreview.blob);
    setPdfPreview({
      state: "ready",
      url,
      blob: initialPdfPreview.blob,
      filename: initialPdfPreview.filename,
    });
  }, [open, initialPdfPreview]);

  useEffect(() => {
    if (!open) {
      setConfirmed(null);
      setBusy(null);
      setPdfPreview(null);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (pdfPreview) setPdfPreview(null);
        else onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, pdfPreview]);

  if (!open) return null;

  const titleSlot = TITLE_ROLE_PRIORITY.map((role) =>
    pairing.slots.find((s) => s.role === role),
  ).find((s) => s !== undefined);

  const flash = (key: ExportKey) => {
    setConfirmed(key);
    setTimeout(() => setConfirmed((current) => (current === key ? null : current)), 1300);
  };

  const handleAction = async (key: ExportKey) => {
    if (busy) return;
    try {
      switch (key) {
        case "pdf": {
          setPdfPreview({ state: "loading" });
          try {
            const blob = await generateSpecimenPdf(pairing, texts, accentColor ?? null);
            const url = URL.createObjectURL(blob);
            const safeName = (pairing.vibe || "fontfun").toLowerCase().replace(/[^a-z0-9]+/g, "-");
            setPdfPreview({ state: "ready", url, blob, filename: `${safeName}-specimen.pdf` });
          } catch (err) {
            setPdfPreview({
              state: "error",
              message: err instanceof Error ? err.message : "PDF generation failed",
            });
          }
          break;
        }
        case "url": {
          await navigator.clipboard.writeText(buildShareUrl(pairing, accentColor));
          flash("url");
          break;
        }
        case "css": {
          await navigator.clipboard.writeText(buildCssSnippet(pairing));
          flash("css");
          break;
        }
        case "tailwind": {
          await navigator.clipboard.writeText(buildTailwindConfig(pairing));
          flash("tailwind");
          break;
        }
        case "json": {
          await navigator.clipboard.writeText(buildJsonExport(pairing));
          flash("json");
          break;
        }
        case "html": {
          await navigator.clipboard.writeText(buildHtmlExport(pairing, texts));
          flash("html");
          break;
        }
      }
    } catch {
      // Silent fail; clipboard / pdf may be blocked
    } finally {
      setBusy(null);
    }
  };

  const inPreview = pdfPreview !== null;

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col w-full overflow-hidden rounded-3xl border shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ease-out transition-[max-width,height] duration-300"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--text)",
          maxWidth: inPreview ? 720 : 448,
          maxHeight: inPreview ? "90vh" : undefined,
        }}
      >
        <header
          className="flex items-center justify-between border-b px-6 py-4 flex-shrink-0"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {inPreview && (
              <button
                onClick={() => setPdfPreview(null)}
                aria-label="Back to export options"
                className="group rounded-full p-2 transition-colors hover:bg-[color:var(--bg)]"
                style={{ color: "var(--text-muted)" }}
              >
                <ArrowLeft01Icon
                  size={18}
                  className="transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:-translate-x-0.5"
                />
              </button>
            )}
            <h2
              className="text-[22px] font-bold tracking-tight leading-none truncate"
              style={titleSlot ? { fontFamily: cssFamily(titleSlot.family) } : undefined}
            >
              {inPreview ? "PDF Preview" : "Export Pairing"}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 transition-colors hover:bg-[color:var(--bg)] flex-shrink-0"
            style={{ color: "var(--text-muted)" }}
          >
            <Cancel01Icon size={20} />
          </button>
        </header>

        {inPreview ? (
          <PdfPreviewBody
            preview={pdfPreview!}
            onDownload={() => {
              if (pdfPreview?.state === "ready") {
                downloadBlob(pdfPreview.blob, pdfPreview.filename);
              }
            }}
          />
        ) : (
        <div className="p-6">
          <div className="grid grid-cols-3 gap-3">
            {ITEMS.map(({ key, label, hint, Icon }) => {
              const isConfirmed = confirmed === key;
              const isBusy = busy === key;
              return (
                <button
                  key={key}
                  onClick={() => handleAction(key)}
                  disabled={Boolean(busy)}
                  aria-label={`Export as ${label}`}
                  className="export-tile group relative flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border p-3 text-center transition-[transform,box-shadow,background-color,border-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] active:scale-[0.97] disabled:opacity-60 disabled:cursor-progress disabled:translate-y-0 disabled:shadow-none"
                  style={{
                    background: isConfirmed ? "var(--bg)" : "var(--surface-muted)",
                    borderColor: isConfirmed ? "var(--accent)" : "var(--border)",
                  }}
                >
                  <span
                    className="flex h-14 w-14 items-center justify-center transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110"
                    style={{ color: "var(--text)" }}
                  >
                    {isConfirmed ? (
                      <Tick02Icon size={40} />
                    ) : isBusy ? (
                      <span className="h-7 w-7 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Icon size={40} strokeWidth={1.6} />
                    )}
                  </span>
                  <span className="flex flex-col items-center leading-tight">
                    <span
                      className="text-[13px] font-bold tracking-tight"
                      style={{ color: "var(--text)" }}
                    >
                      {isConfirmed ? confirmedCopy(key) : label}
                    </span>
                    {!isConfirmed && (
                      <span
                        className="mt-0.5 text-[10px] tracking-tight opacity-70"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {hint}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

function PdfPreviewBody({
  preview,
  onDownload,
}: {
  preview: PdfPreview;
  onDownload: () => void;
}) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div
        className="flex-1 min-h-0 m-4 rounded-xl border overflow-hidden flex items-center justify-center"
        style={{
          background: "var(--bg)",
          borderColor: "var(--border)",
          minHeight: 480,
        }}
      >
        {preview.state === "loading" && <TypesettingLoader />}

        {preview.state === "ready" && (
          <iframe
            title="PDF preview"
            src={`${preview.url}#toolbar=0&navpanes=0`}
            className="w-full h-full"
            style={{ minHeight: 480, border: "none", background: "#fff" }}
          />
        )}

        {preview.state === "error" && (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center max-w-sm">
            <p className="text-[13px] font-bold" style={{ color: "var(--text)" }}>
              Couldn’t generate the PDF
            </p>
            <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
              {preview.message}
            </p>
          </div>
        )}
      </div>

      <div
        className="flex items-center justify-end gap-2 border-t px-4 py-3 flex-shrink-0"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          onClick={onDownload}
          disabled={preview.state !== "ready"}
          className="inline-flex items-center gap-2 rounded-xl h-10 px-5 text-[13px] font-bold tracking-tight transition-[transform,box-shadow,opacity] duration-200 hover:-translate-y-px active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
          style={{
            background: "var(--text)",
            color: "var(--bg)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <Download01Icon size={16} />
          Download PDF
        </button>
      </div>
    </div>
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

function confirmedCopy(key: ExportKey): string {
  switch (key) {
    case "pdf":      return "Saved";
    case "url":      return "Copied";
    case "css":      return "Copied";
    case "tailwind": return "Copied";
    case "json":     return "Copied";
    case "html":     return "Copied";
  }
}
