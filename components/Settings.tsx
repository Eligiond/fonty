"use client";

import { useEffect, useRef, useState } from "react";
import { X, Moon, Sun, Check, Heart, Upload, Trash2 } from "lucide-react";
import { THEMES, type ThemeId } from "@/lib/themes";
import { ALL_POOL_FONTS } from "@/lib/fonts";

const PROFILE_KEY = "fonty:profile";
const FAVORITES_KEY = "fonty:favorites";
const CUSTOM_FONTS_KEY = "fonty:custom-fonts";

type CustomFont = {
  name: string;
  dataUrl: string;
};

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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);
  const [uploading, setUploading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p.name) setName(p.name);
        if (p.email) setEmail(p.email);
      }
    } catch {}
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (raw) setFavorites(new Set(JSON.parse(raw)));
    } catch {}
    try {
      const raw = localStorage.getItem(CUSTOM_FONTS_KEY);
      if (raw) {
        const fonts: CustomFont[] = JSON.parse(raw);
        setCustomFonts(fonts);
        fonts.forEach(injectFontFace);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const saveProfile = () => {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify({ name, email }));
    } catch {}
  };

  const toggleFavorite = (font: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(font)) next.delete(font);
      else next.add(font);
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const fontName = file.name
        .replace(/\.(ttf|otf|woff2?|eot)$/i, "")
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      const font: CustomFont = { name: fontName, dataUrl };
      injectFontFace(font);
      setCustomFonts((prev) => {
        const next = [...prev, font];
        try {
          localStorage.setItem(CUSTOM_FONTS_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    } catch (err) {
      console.error("Font upload failed", err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeCustomFont = (fontName: string) => {
    setCustomFonts((prev) => {
      const next = prev.filter((f) => f.name !== fontName);
      try {
        localStorage.setItem(CUSTOM_FONTS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex"
      style={{ animation: "fonty-fade-in 180ms cubic-bezier(0.23, 1, 0.32, 1)" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.45)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative ml-auto flex h-full w-full max-w-md flex-col overflow-y-auto shadow-2xl"
        style={{
          background: "var(--bg)",
          color: "var(--text)",
          animation: "fonty-slide-right 220ms cubic-bezier(0.23, 1, 0.32, 1)",
        }}
        role="dialog"
        aria-label="Settings"
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4"
          style={{ background: "var(--bg)", borderColor: "var(--border)" }}
        >
          <span className="text-[13px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--text-muted)" }}>
            Settings
          </span>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="rounded-full p-1.5 transition-colors hover:bg-[color:var(--surface)]"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-8 px-6 py-6">
          {/* Profile */}
          <Section title="Profile">
            <div className="flex flex-col gap-3">
              <Field label="Name">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={saveProfile}
                  placeholder="Your name"
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-[color:var(--accent)]"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                    color: "var(--text)",
                  }}
                />
              </Field>
              <Field label="Email">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={saveProfile}
                  placeholder="your@email.com"
                  type="email"
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-[color:var(--accent)]"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                    color: "var(--text)",
                  }}
                />
              </Field>
            </div>
          </Section>

          {/* Appearance */}
          <Section title="Appearance">
            <div className="flex flex-col gap-4">
              <div>
                <div className="mb-3 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  Color theme
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {THEMES.map((t) => {
                    const palette = isDark ? t.dark : t.light;
                    const active = t.id === themeId;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setThemeId(t.id as ThemeId)}
                        aria-label={t.name}
                        title={t.name}
                        className="relative h-8 w-8 flex-shrink-0 rounded-full border transition-shadow"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${palette.stripe1} 0% 50%, ${palette.stripe3} 50% 100%)`,
                          borderColor: active ? "var(--text)" : "var(--border)",
                          boxShadow: active
                            ? "0 0 0 2px var(--bg), 0 0 0 3px var(--text)"
                            : undefined,
                        }}
                      >
                        {active && (
                          <Check
                            className="absolute inset-0 m-auto h-3.5 w-3.5"
                            style={{ color: palette.accent }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => setIsDark(!isDark)}
                className="flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors hover:bg-[color:var(--surface-muted)]"
                style={{ borderColor: "var(--border)" }}
              >
                <span className="inline-flex items-center gap-2.5">
                  {isDark ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">Dark mode</span>
                </span>
                <Toggle active={isDark} />
              </button>
            </div>
          </Section>

          {/* Favorite Fonts */}
          <Section title={`Favorite Fonts${favorites.size > 0 ? ` · ${favorites.size}` : ""}`}>
            <div
              className="flex max-h-72 flex-col gap-0.5 overflow-y-auto rounded-lg border"
              style={{ borderColor: "var(--border)" }}
            >
              {ALL_POOL_FONTS.map((font, i) => {
                const fav = favorites.has(font);
                return (
                  <button
                    key={font}
                    onClick={() => toggleFavorite(font)}
                    className="flex items-center justify-between px-3 py-2.5 text-left text-[13px] transition-colors hover:bg-[color:var(--surface)]"
                    style={{
                      borderBottom:
                        i < ALL_POOL_FONTS.length - 1
                          ? `1px solid var(--border)`
                          : undefined,
                      color: fav ? "var(--text)" : "var(--text-muted)",
                    }}
                  >
                    <span style={{ fontFamily: `"${font}", system-ui, sans-serif` }}>
                      {font}
                    </span>
                    <Heart
                      className="h-3.5 w-3.5 flex-shrink-0 transition-colors"
                      style={{
                        color: fav ? "var(--accent)" : "var(--border)",
                        fill: fav ? "var(--accent)" : "transparent",
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Custom Fonts */}
          <Section title="Custom Fonts">
            <div className="flex flex-col gap-3">
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Upload a .ttf, .otf, .woff or .woff2 file. It will be injected into the page immediately and remembered across sessions.
              </p>

              <input
                ref={fileRef}
                type="file"
                accept=".ttf,.otf,.woff,.woff2"
                className="hidden"
                onChange={handleUpload}
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[color:var(--surface)] disabled:opacity-50"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              >
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading…" : "Upload font file"}
              </button>

              {customFonts.length > 0 && (
                <ul className="flex flex-col gap-1">
                  {customFonts.map((f) => (
                    <li
                      key={f.name}
                      className="flex items-center justify-between rounded-md border px-3 py-2"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <span
                        className="text-sm"
                        style={{ fontFamily: `"${f.name}", system-ui, sans-serif` }}
                      >
                        {f.name}
                      </span>
                      <button
                        onClick={() => removeCustomFont(f.name)}
                        aria-label={`Remove ${f.name}`}
                        className="rounded p-1 transition-colors hover:bg-[color:var(--surface-muted)]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        className="mb-4 text-[10px] uppercase tracking-[0.18em]"
        style={{ color: "var(--text-muted)" }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Toggle({ active }: { active: boolean }) {
  return (
    <span
      className="relative inline-flex h-5 w-8 flex-shrink-0 items-center rounded-full transition-colors"
      style={{ background: active ? "var(--accent)" : "var(--surface-muted)" }}
    >
      <span
        className="absolute h-3.5 w-3.5 rounded-full transition-transform"
        style={{
          background: active ? "var(--accent-text)" : "var(--text-muted)",
          transform: active ? "translateX(17px)" : "translateX(3px)",
          transitionDuration: "180ms",
          transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      />
    </span>
  );
}

function injectFontFace(font: CustomFont) {
  const id = `fonty-custom-${font.name.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = `@font-face { font-family: "${font.name}"; src: url("${font.dataUrl}"); font-display: swap; }`;
  document.head.appendChild(style);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
