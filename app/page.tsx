"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FONT_PAIRINGS,
  pickRandomPairing,
  type FontPairing,
  type FontRole,
} from "@/lib/fonts";
import { THEMES, getTheme, paletteToCssVars, type ThemeId } from "@/lib/themes";
import Sidebar, { type SavedItem } from "@/components/Sidebar";
import TopBar, { type Tab, type ViewMode } from "@/components/TopBar";
import GenerateView, { type Texts } from "@/components/GenerateView";
import MockupView from "@/components/MockupView";
import ControlsPanel, {
  DEFAULT_ADJUSTMENTS,
  type Adjustments,
} from "@/components/ControlsPanel";
import SettingsPanel from "@/components/Settings";

type LockState = Record<FontRole, boolean>;

const STORAGE_KEY = "fonty:saved";
const PREFS_KEY = "fonty:prefs";

const HEADING_SYNONYMS = [
  "softly",
  "subtly",
  "intentionally",
  "tenderly",
  "quietly",
  "gracefully",
  "deliberately",
  "thoughtfully",
  "clearly",
  "warmly",
  "honestly",
  "plainly",
];

const DEFAULT_TEXTS: Texts = {
  heading: `Design that speaks ${HEADING_SYNONYMS[0]}.`,
  subheading: "A type system for products that aim to feel considered.",
  body: "Typography is the voice of an interface — pick a pairing that says what you want before a single word is read.",
};

const pickNextWordIndex = (current: number) => {
  if (HEADING_SYNONYMS.length <= 1) return 0;
  let next = current;
  while (next === current) {
    next = Math.floor(Math.random() * HEADING_SYNONYMS.length);
  }
  return next;
};

export default function Page() {
  const [pairing, setPairing] = useState<FontPairing>(FONT_PAIRINGS[0]);
  const [locks, setLocks] = useState<LockState>({
    heading: false,
    subheading: false,
    body: false,
  });
  const [tab, setTab] = useState<Tab>("generate");
  const [viewMode, setViewMode] = useState<ViewMode>("vertical");
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [activeSavedId, setActiveSavedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  const [texts, setTexts] = useState<Texts>(DEFAULT_TEXTS);
  const [headingTouched, setHeadingTouched] = useState(false);

  const [adjustments, setAdjustments] = useState<Adjustments>(DEFAULT_ADJUSTMENTS);

  const [themeId, setThemeId] = useState<ThemeId>("cream");
  const [isDark, setIsDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Hydrate
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSaved(JSON.parse(raw));
    } catch {}
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) {
        const prefs = JSON.parse(raw);
        if (prefs.themeId) setThemeId(prefs.themeId);
        if (typeof prefs.isDark === "boolean") setIsDark(prefs.isDark);
        if (typeof prefs.sidebarOpen === "boolean") setSidebarOpen(prefs.sidebarOpen);
      }
    } catch {}
  }, []);

  // Persist preferences
  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ themeId, isDark, sidebarOpen }));
    } catch {}
  }, [themeId, isDark, sidebarOpen]);

  const persistSaved = (next: SavedItem[]) => {
    setSaved(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const roll = useCallback(() => {
    setPairing((current) => {
      const next = pickRandomPairing(current.id);
      return {
        id: next.id,
        vibe: next.vibe,
        heading: locks.heading ? current.heading : next.heading,
        subheading: locks.subheading ? current.subheading : next.subheading,
        body: locks.body ? current.body : next.body,
      };
    });
    setWordIndex((i) => {
      const next = pickNextWordIndex(i);
      if (!headingTouched) {
        setTexts((t) => ({
          ...t,
          heading: `Design that speaks ${HEADING_SYNONYMS[next]}.`,
        }));
      }
      return next;
    });
    setActiveSavedId(null);
  }, [locks, headingTouched]);

  // Spacebar listener — ignore when typing in any editable surface
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      roll();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [roll]);

  const toggleLock = (role: FontRole) =>
    setLocks((l) => ({ ...l, [role]: !l[role] }));

  const onTextChange = (role: FontRole, value: string) => {
    const v = value.trim().length === 0 ? DEFAULT_TEXTS[role] : value;
    setTexts((t) => ({ ...t, [role]: v }));
    if (role === "heading") setHeadingTouched(true);
  };

  const savePairing = () => {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const baseName = pairing.vibe;
    const sameNameCount = saved.filter((s) =>
      s.name.startsWith(baseName),
    ).length;
    const name =
      sameNameCount === 0 ? baseName : `${baseName} · ${sameNameCount + 1}`;
    const item: SavedItem = { id, name, snapshot: { ...pairing } };
    persistSaved([item, ...saved]);
    setActiveSavedId(id);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
  };

  const renameSaved = (id: string, name: string) =>
    persistSaved(saved.map((s) => (s.id === id ? { ...s, name } : s)));

  const deleteSaved = (id: string) => {
    persistSaved(saved.filter((s) => s.id !== id));
    if (activeSavedId === id) setActiveSavedId(null);
  };

  const loadSaved = (item: SavedItem) => {
    setPairing(item.snapshot);
    setActiveSavedId(item.id);
  };

  const tailwindConfig = useMemo(() => buildTailwindConfig(pairing), [pairing]);
  const copyConfig = async () => {
    try {
      await navigator.clipboard.writeText(tailwindConfig);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const theme = getTheme(themeId);
  const palette = isDark ? theme.dark : theme.light;
  const themeStyle = paletteToCssVars(palette);

  return (
    <main
      className="flex h-screen w-screen overflow-hidden"
      style={{ ...themeStyle, background: palette.bg, color: palette.text }}
    >
      <Sidebar
        open={sidebarOpen}
        saved={saved}
        activeId={activeSavedId}
        onLoad={loadSaved}
        onRename={renameSaved}
        onDelete={deleteSaved}
        onNewRoll={roll}
        onOpenSettings={() => setSettingsOpen(true)}
        themeId={themeId}
        setThemeId={setThemeId}
        isDark={isDark}
        setIsDark={setIsDark}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          tab={tab}
          setTab={setTab}
          viewMode={viewMode}
          setViewMode={setViewMode}
          vibe={pairing.vibe}
          onSave={savePairing}
          justSaved={justSaved}
          onCopy={copyConfig}
          copied={copied}
          sidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen((v) => !v)}
        />
        <div className="flex min-h-0 flex-1">
          <div className="relative min-w-0 flex-1">
            {tab === "generate" ? (
              <GenerateView
                pairing={pairing}
                locks={locks}
                onToggleLock={toggleLock}
                texts={texts}
                onTextChange={onTextChange}
                adjustments={adjustments}
                viewMode={viewMode}
              />
            ) : (
              <MockupView
                pairing={pairing}
                texts={texts}
                onTextChange={onTextChange}
                adjustments={adjustments}
              />
            )}
          </div>
          <ControlsPanel values={adjustments} onChange={setAdjustments} />
        </div>
      </div>

      {settingsOpen && (
        <SettingsPanel
          themeId={themeId}
          setThemeId={setThemeId}
          isDark={isDark}
          setIsDark={setIsDark}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </main>
  );
}

function buildTailwindConfig(p: FontPairing): string {
  const fam = (name: string) => `['${name}', 'system-ui', 'sans-serif']`;
  const fontUrl = (name: string) => name.replace(/\s+/g, "+");
  return `// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading:    ${fam(p.heading)},
        subheading: ${fam(p.subheading)},
        body:       ${fam(p.body)},
      },
    },
  },
} satisfies Config;

// Load via Google Fonts:
// https://fonts.googleapis.com/css2?family=${fontUrl(p.heading)}:wght@400;600;700&family=${fontUrl(p.subheading)}:wght@400;500;600&family=${fontUrl(p.body)}:wght@400;500&display=swap
`;
}
