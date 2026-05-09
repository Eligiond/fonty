"use client";

import { useEffect, useState } from "react";
import {
  Cancel01Icon,
  Pdf02Icon,
  Link04Icon,
  CodeIcon,
  DocumentCodeIcon,
  SecondBracketIcon,
  Tick02Icon,
} from "@hugeicons/react";
import type { FontPairing } from "@/lib/fonts";
import {
  buildShareUrl,
  buildCssSnippet,
  buildJsonExport,
  buildTailwindConfig,
} from "@/lib/share";
import { generateSpecimenPdf, downloadBlob } from "@/lib/pdf";
import type { Texts } from "./GenerateView";

type Props = {
  open: boolean;
  onClose: () => void;
  pairing: FontPairing;
  texts: Texts;
  accentColor?: string | null;
};

type ExportKey = "pdf" | "url" | "css" | "tailwind" | "json";

const ITEMS: {
  key: ExportKey;
  label: string;
  hint: string;
  Icon: typeof Pdf02Icon;
}[] = [
  { key: "pdf",      label: "PDF",      hint: "Specimen sheet",       Icon: Pdf02Icon },
  { key: "url",      label: "URL",      hint: "Shareable link",       Icon: Link04Icon },
  { key: "css",      label: "CSS",      hint: "@import + variables",  Icon: CodeIcon },
  { key: "tailwind", label: "Tailwind", hint: "tailwind.config.ts",   Icon: DocumentCodeIcon },
  { key: "json",     label: "JSON",     hint: "Pairing object",       Icon: SecondBracketIcon },
];

export default function ExportMenu({ open, onClose, pairing, texts, accentColor }: Props) {
  const [confirmed, setConfirmed] = useState<ExportKey | null>(null);
  const [busy, setBusy] = useState<ExportKey | null>(null);

  useEffect(() => {
    if (!open) {
      setConfirmed(null);
      setBusy(null);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const flash = (key: ExportKey) => {
    setConfirmed(key);
    setTimeout(() => setConfirmed((current) => (current === key ? null : current)), 1300);
  };

  const handleAction = async (key: ExportKey) => {
    if (busy) return;
    try {
      switch (key) {
        case "pdf": {
          setBusy("pdf");
          const blob = await generateSpecimenPdf(pairing, texts, accentColor ?? null);
          const safeName = (pairing.vibe || "fontfun").toLowerCase().replace(/[^a-z0-9]+/g, "-");
          downloadBlob(blob, `${safeName}-specimen.pdf`);
          flash("pdf");
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
      }
    } catch {
      // Silent fail; clipboard / pdf may be blocked
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ease-out"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--text)",
        }}
      >
        <header
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: "var(--border)" }}
        >
          <h2 className="font-logo text-xl tracking-tight">Export Pairing</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 transition-colors hover:bg-[color:var(--bg)]"
            style={{ color: "var(--text-muted)" }}
          >
            <Cancel01Icon size={20} />
          </button>
        </header>

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
                    className="flex h-10 w-10 items-center justify-center transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110"
                    style={{ color: "var(--text)" }}
                  >
                    {isConfirmed ? (
                      <Tick02Icon size={26} />
                    ) : isBusy ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Icon size={26} />
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
  }
}
