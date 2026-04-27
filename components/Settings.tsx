"use client";

import {
  Cancel01Icon,
  Moon01Icon,
  Sun01Icon,
  Tick02Icon,
  Upload01Icon,
  Delete02Icon,
} from "@hugeicons/react";
import { THEMES, type ThemeId } from "@/lib/themes";

type Props = {
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
  isDark: boolean;
  setIsDark: (v: boolean) => void;
  onClose: () => void;
};

export default function SettingsPanel({
  themeId,
  setThemeId,
  isDark,
  setIsDark,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ease-out"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--text)",
        }}
      >
        <header className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-logo text-xl tracking-tight">Settings</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-[color:var(--bg)]"
            style={{ color: "var(--text-muted)" }}
          >
            <Cancel01Icon size={20} />
          </button>
        </header>

        <div className="space-y-8 p-6">
          {/* Appearance Section */}
          <section>
            <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">
              Appearance
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsDark(false)}
                className={`flex items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-semibold transition-all ${
                  !isDark ? "shadow-md scale-[1.02]" : "opacity-60 grayscale"
                }`}
                style={{
                  background: !isDark ? "var(--bg)" : "transparent",
                  borderColor: !isDark ? "var(--accent)" : "var(--border)",
                }}
              >
                <Sun01Icon size={18} />
                Light
              </button>
              <button
                onClick={() => setIsDark(true)}
                className={`flex items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-semibold transition-all ${
                  isDark ? "shadow-md scale-[1.02]" : "opacity-60 grayscale"
                }`}
                style={{
                  background: isDark ? "var(--bg)" : "transparent",
                  borderColor: isDark ? "var(--accent)" : "var(--border)",
                }}
              >
                <Moon01Icon size={18} />
                Dark
              </button>
            </div>
          </section>

          {/* Theme Section */}
          <section>
            <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">
              Theme Palette
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setThemeId(t.id)}
                  className={`group relative flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all ${
                    themeId === t.id ? "shadow-md scale-[1.02]" : "opacity-60"
                  }`}
                  style={{
                    background: themeId === t.id ? "var(--bg)" : "transparent",
                    borderColor: themeId === t.id ? "var(--accent)" : "var(--border)",
                  }}
                >
                  <div
                    className="h-8 w-8 rounded-full border shadow-inner transition-transform group-hover:scale-110"
                    style={{ background: t.swatch, borderColor: "var(--border)" }}
                  />
                  <span className="text-xs font-bold">{t.name}</span>
                  {themeId === t.id && (
                    <div className="absolute -right-1 -top-1 rounded-full bg-[color:var(--accent)] p-0.5 text-[color:var(--accent-text)] shadow-sm">
                      <Tick02Icon size={10} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Export/Import Simulation */}
          <section>
            <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">
              Data Management
            </h3>
            <div className="flex flex-col gap-2">
               <button className="flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-colors hover:bg-[color:var(--bg)]" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-3">
                    <Upload01Icon size={18} className="opacity-60" />
                    Export all pairings
                  </div>
                  <span className="text-[10px] opacity-40">JSON</span>
               </button>
               <button className="flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-colors hover:bg-[color:var(--bg)]" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-3 text-red-500">
                    <Delete02Icon size={18} />
                    Reset local data
                  </div>
               </button>
            </div>
          </section>
        </div>

        <footer className="border-t bg-[color:var(--surface-muted)] px-6 py-4 text-center" style={{ borderColor: "var(--border)" }}>
           <p className="text-[11px] font-medium opacity-40">
             Fonty v0.2.0 · Professional Typographic Workspace
           </p>
        </footer>
      </div>
    </div>
  );
}
