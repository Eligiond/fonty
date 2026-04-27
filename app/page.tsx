"use client";

import { useCallback, useMemo, useState } from "react";
import {
  FONT_PAIRINGS,
  pickRandomPairing,
  type FontPairing,
  type FontRole,
} from "@/lib/fonts";
import { getTheme, paletteToCssVars } from "@/lib/themes";
import TopBar from "@/components/TopBar";
import GenerateView, { type Texts } from "@/components/GenerateView";
import MockupView from "@/components/MockupView";
import SidePanel, {
  DEFAULT_ADJUSTMENTS,
  type Adjustments,
} from "@/components/SidePanel";
import SettingsPanel from "@/components/Settings";
import { Tick02Icon } from "@hugeicons/react";

// Hooks
import { usePreferences } from "@/hooks/usePreferences";
import { useSavedPairings } from "@/hooks/useSavedPairings";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useRef, useEffect } from "react";

type LockState = Record<FontRole, boolean>;

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
  
  const {
    themeId, setThemeId,
    isDark, setIsDark,
    panelOpen, setPanelOpen,
    panelTab, setPanelTab,
    panelWidth, setPanelWidth,
    viewMode, setViewMode,
    mockupOffsets, setMockupOffsets,
    mockupWidths, setMockupWidths,
  } = usePreferences();

  const {
    saved,
    activeSavedId, setActiveSavedId,
    copied, setCopied,
    justSaved, setJustSaved,
    onConfirmSave,
    renameSaved,
    deleteSaved,
    setSavedColor,
    loadSaved,
  } = useSavedPairings(pairing);

  const [texts, setTexts] = useState<Texts>(DEFAULT_TEXTS);
  const [adjustments, setAdjustments] = useState<Adjustments>(DEFAULT_ADJUSTMENTS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);

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
  }, [locks, setActiveSavedId]);

  useKeyboardShortcuts({ roll, setPanelOpen, setSettingsOpen });

  const toggleLock = (role: FontRole) =>
    setLocks((l) => ({ ...l, [role]: !l[role] }));

  const onTextChange = (role: FontRole, value: string) => {
    const v = value.trim().length === 0 ? DEFAULT_TEXTS[role] : value;
    setTexts((t) => ({ ...t, [role]: v }));
  };

  const handleConfirmSave = (name: string, description: string) => {
    onConfirmSave(name, description);
    setSaveModalOpen(false);
    setPanelOpen(true);
    setPanelTab("saved");
  };

  const activeColor = useMemo(
    () => saved.find((item) => item.id === activeSavedId)?.color ?? null,
    [saved, activeSavedId],
  );

  const theme = getTheme(themeId);
  const palette = isDark ? theme.dark : theme.light;
  const themeStyle = paletteToCssVars(palette);

  return (
    <main
      className="flex h-screen w-screen overflow-hidden"
      style={{ ...themeStyle, background: palette.bg, color: palette.text }}
    >
      <div className="relative min-w-0 flex-1">
        <div className="absolute inset-x-0 top-0 z-20">
          <TopBar
            viewMode={viewMode}
            setViewMode={setViewMode}
            vibe={pairing.vibe}
            isDark={isDark}
            onSave={() => setSaveModalOpen(true)}
            justSaved={justSaved}
            onCopy={async () => {
              const config = buildTailwindConfig(pairing);
              try {
                await navigator.clipboard.writeText(config);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              } catch {}
            }}
            copied={copied}
            activeColor={activeColor}
          />
        </div>
        <div className="absolute inset-0">
          {viewMode === "scroll" ? (
            <MockupView
              pairing={pairing}
              texts={texts}
              onTextChange={onTextChange}
              adjustments={adjustments}
              locks={locks}
              onToggleLock={toggleLock}
              offsets={mockupOffsets}
              setOffsets={setMockupOffsets}
              widths={mockupWidths}
              setWidths={setMockupWidths}
            />
          ) : (
            <GenerateView
              pairing={pairing}
              locks={locks}
              onToggleLock={toggleLock}
              texts={texts}
              onTextChange={onTextChange}
              adjustments={adjustments}
              viewMode={viewMode}
            />
          )}
        </div>
      </div>
      <SidePanel
        open={panelOpen}
        onToggle={() => setPanelOpen((v) => !v)}
        width={panelWidth}
        onWidthChange={setPanelWidth}
        tab={panelTab}
        onTabChange={setPanelTab}
        saved={saved}
        activeId={activeSavedId}
        onLoad={(item) => loadSaved(item, setPairing)}
        onRename={renameSaved}
        onDelete={deleteSaved}
        onSetColor={setSavedColor}
        values={adjustments}
        onChange={setAdjustments}
        onOpenSettings={() => setSettingsOpen(true)}
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

      {saveModalOpen && (
        <SaveModal 
            onConfirm={handleConfirmSave}
            onCancel={() => setSaveModalOpen(false)}
            defaultName={pairing.vibe}
        />
      )}
    </main>
  );
}

function SaveModal({ onConfirm, onCancel, defaultName }: { 
    onConfirm: (name: string, description: string) => void;
    onCancel: () => void;
    defaultName: string;
}) {
    const [name, setName] = useState(defaultName);
    const [description, setDescription] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    const handleConfirm = () => {
        if (!name.trim()) return;
        onConfirm(name.trim(), description.trim());
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onCancel} />
            <div 
                className="relative w-full max-w-sm rounded-2xl border p-6 shadow-2xl animate-in fade-in zoom-in duration-200"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") handleConfirm();
                    if (e.key === "Escape") onCancel();
                }}
            >
                <h2 className="text-lg font-bold tracking-tight mb-4">Save Pairing</h2>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-widest opacity-50 ml-1">Name</label>
                        <input 
                            ref={inputRef}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Vibe name..."
                            className="w-full h-10 rounded-xl px-3 text-[13px] outline-none border-2 transition-all focus:border-[var(--accent)]"
                            style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-widest opacity-50 ml-1">Description</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional notes..."
                            className="w-full h-24 rounded-xl px-3 py-2 text-[13px] outline-none border-2 transition-all focus:border-[var(--accent)] resize-none"
                            style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-8">
                    <button 
                        onClick={onCancel}
                        className="h-10 px-4 rounded-xl text-[13px] font-bold transition-all hover:bg-[color:var(--surface-muted)] active:scale-95"
                        style={{ color: "var(--text-muted)" }}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirm}
                        className="h-10 px-6 rounded-xl text-[13px] font-bold transition-all hover:opacity-90 active:scale-95 flex items-center gap-2"
                        style={{ background: "var(--accent)", color: "var(--accent-text)" }}
                    >
                        <Tick02Icon size={18} />
                        Save Pairing
                    </button>
                </div>
            </div>
        </div>
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
