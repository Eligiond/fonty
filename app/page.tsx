"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FONT_PAIRINGS,
  pickRandomPairing,
  type FontPairing,
  type FontRole,
} from "@/lib/fonts";
import { THEMES, getTheme, paletteToCssVars, type ThemeId } from "@/lib/themes";
import Sidebar, { SIDEBAR_DEFAULT, SIDEBAR_MIN, SIDEBAR_MAX, type SavedItem } from "@/components/Sidebar";
import TopBar, { type Tab, type ViewMode } from "@/components/TopBar";
import GenerateView, { type Texts } from "@/components/GenerateView";
import MockupView from "@/components/MockupView";
import ControlsPanel, {
  CONTROLS_DEFAULT,
  CONTROLS_MIN,
  CONTROLS_MAX,
  DEFAULT_ADJUSTMENTS,
  type Adjustments,
} from "@/components/ControlsPanel";
import SettingsPanel from "@/components/Settings";

type LockState = Record<FontRole, boolean>;

const STORAGE_KEY = "fonty:saved";
const PREFS_KEY = "fonty:prefs";

const DEFAULT_TEXTS: Texts = {
  heading: "Find font pairings that give your product character.",
  subheading: "Fonty provides design teams with an intentional system for typography and pairing, ensuring every product interface speaks with clarity and soul.",
  body: "Typography is intentional because it's not about product, but rather about the UX/UI experience, of which 50% is just typeset. Fonty keeps your visual language consistent from the marketing site to the production app. Set your tokens once and every team - engineering, design, content - pulls from the same source of truth.",
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

  const [texts, setTexts] = useState<Texts>(DEFAULT_TEXTS);

  const [adjustments, setAdjustments] = useState<Adjustments>(DEFAULT_ADJUSTMENTS);

  const [themeId, setThemeId] = useState<ThemeId>("stunning");
  const [isDark, setIsDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT);
  const [controlsWidth, setControlsWidth] = useState(CONTROLS_DEFAULT);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
        if (typeof prefs.controlsOpen === "boolean") setControlsOpen(prefs.controlsOpen);
        if (typeof prefs.sidebarWidth === "number") {
          setSidebarWidth(Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, prefs.sidebarWidth)));
        }
        if (typeof prefs.controlsWidth === "number") {
          setControlsWidth(Math.max(CONTROLS_MIN, Math.min(CONTROLS_MAX, prefs.controlsWidth)));
        }
      }
    } catch {}
  }, []);

  // Persist preferences
  useEffect(() => {
    try {
      localStorage.setItem(
        PREFS_KEY,
        JSON.stringify({ themeId, isDark, sidebarOpen, controlsOpen, sidebarWidth, controlsWidth }),
      );
    } catch {}
  }, [themeId, isDark, sidebarOpen, controlsOpen, sidebarWidth, controlsWidth]);

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
    setActiveSavedId(null);
  }, [locks]);

  // Spacebar listener
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

  // Cmd/Ctrl shortcuts: ⌘. toggles sidebar, ⌘K focuses search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const cmd = e.metaKey || e.ctrlKey;
      if (!cmd) return;

      if (e.key === ".") {
        e.preventDefault();
        setSidebarOpen((v) => !v);
        return;
      }

      if (e.key === "k" || e.key === "K") {
        e.preventDefault();
        if (!sidebarOpen) {
          setSidebarOpen(true);
          // Wait for the sidebar's width transition (300ms) before focusing
          setTimeout(() => searchInputRef.current?.focus(), 320);
        } else {
          searchInputRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  const toggleLock = (role: FontRole) =>
    setLocks((l) => ({ ...l, [role]: !l[role] }));

  const onTextChange = (role: FontRole, value: string) => {
    const v = value.trim().length === 0 ? DEFAULT_TEXTS[role] : value;
    setTexts((t) => ({ ...t, [role]: v }));
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

  const setSavedColor = (id: string, color: string | null) =>
    persistSaved(saved.map((s) => (s.id === id ? { ...s, color } : s)));

  const deleteSaved = (id: string) => {
    persistSaved(saved.filter((s) => s.id !== id));
    if (activeSavedId === id) setActiveSavedId(null);
  };

  const loadSaved = (item: SavedItem) => {
    setPairing(item.snapshot);
    setActiveSavedId(item.id);
  };

  const activeSavedColor = useMemo(() => {
    if (!activeSavedId) return null;
    return saved.find((s) => s.id === activeSavedId)?.color ?? null;
  }, [activeSavedId, saved]);

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
        onToggle={() => setSidebarOpen((v) => !v)}
        saved={saved}
        activeId={activeSavedId}
        onLoad={loadSaved}
        onRename={renameSaved}
        onDelete={deleteSaved}
        onSetColor={setSavedColor}
        onNewRoll={roll}
        onOpenSettings={() => setSettingsOpen(true)}
        themeId={themeId}
        setThemeId={setThemeId}
        isDark={isDark}
        setIsDark={setIsDark}
        width={sidebarWidth}
        onWidthChange={setSidebarWidth}
        searchInputRef={searchInputRef}
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
          controlsOpen={controlsOpen}
          onControlsToggle={() => setControlsOpen((v) => !v)}
          activeColor={activeSavedColor}
        />
        <div className="flex min-h-0 flex-1 relative">
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
                locks={locks}
                onToggleLock={toggleLock}
              />
            )}
        </div>
      </div>
      <ControlsPanel
        values={adjustments}
        onChange={setAdjustments}
        open={controlsOpen}
        onToggle={() => setControlsOpen((v) => !v)}
        width={controlsWidth}
        onWidthChange={setControlsWidth}
      />

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
