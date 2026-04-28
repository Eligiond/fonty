"use client";

import { useCallback, useMemo, useState } from "react";
import {
  FONT_PAIRINGS,
  rollPairing,
  pickFamilyForRole,
  buildUrlForFamilies,
  MAX_SLOTS,
  MIN_SLOTS,
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
  subheading: "Fontly delivers an intentional typography system, giving every single product interface clarity and soul.",
  body: "I built Fontly to visually test fonts for my startup’s landing page. It’s for designers, devs, or anyone curious enough to explore pairings until they find the right fit. Fontly ensures combinations work together from site to product without the design getting messy.",
  caption: "Browse (or spam the space bar for fun!) through production-ready font pairings and find what best fits your project! Have a feature req? Reach out!",
};

export default function Page() {
  const [pairing, setPairing] = useState<FontPairing>(FONT_PAIRINGS[0]);
  const [buffer, setBuffer] = useState<FontPairing[]>([]);
  const [locks, setLocks] = useState<LockState>({
    heading: false,
    subheading: false,
    body: false,
    caption: false,
  });

  // Keep buffer filled to 10 items
  useEffect(() => {
    if (buffer.length < 10) {
      setBuffer((prev) => {
        const needed = 10 - prev.length;
        const nextBatch: FontPairing[] = [];
        let currentSeed = prev.length > 0 ? prev[prev.length - 1] : pairing;
        
        for (let i = 0; i < needed; i++) {
          const next = rollPairing(currentSeed, locks);
          nextBatch.push(next);
          currentSeed = next;
        }
        return [...prev, ...nextBatch];
      });
    }
  }, [buffer.length, pairing, locks]);

  // Clear buffer on lock changes so next rolls are valid
  useEffect(() => {
    setBuffer([]);
  }, [locks]);

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
  const autoCloseRef = useRef(false);
  const loadedFontsRef = useRef<Set<string>>(new Set());

  const lastRollTime = useRef(0);
  const roll = useCallback(() => {
    const now = Date.now();
    if (now - lastRollTime.current < 200) return;
    lastRollTime.current = now;
    
    if (buffer.length > 0) {
      const next = buffer[0];
      setPairing(next);
      setBuffer((prev) => prev.slice(1));
    } else {
      // Emergency fallback if buffer is empty
      setPairing((current) => rollPairing(current, locks));
    }
    
    setActiveSavedId(null);
  }, [buffer, locks, setActiveSavedId]);

  const addSlot = useCallback(() => {
    setPairing((current) => {
      if (current.slots.length >= MAX_SLOTS) return current;
      const present = new Set(current.slots.map((s) => s.role));
      const order: FontRole[] = ["caption", "subheading", "body", "heading"];
      const role = order.find((r) => !present.has(r));
      if (!role) return current;
      const used = current.slots.map((s) => s.family);
      const family = pickFamilyForRole(role, used);
      return { ...current, slots: [...current.slots, { role, family }] };
    });
  }, []);

  const removeSlot = useCallback((role: FontRole) => {
    setPairing((current) => {
      if (current.slots.length <= MIN_SLOTS) return current;
      return { ...current, slots: current.slots.filter((s) => s.role !== role) };
    });
  }, []);

  const reorderSlots = useCallback((fromIdx: number, toIdx: number) => {
    setPairing((current) => {
      if (
        fromIdx === toIdx ||
        fromIdx < 0 ||
        toIdx < 0 ||
        fromIdx >= current.slots.length ||
        toIdx >= current.slots.length
      ) {
        return current;
      }
      const next = current.slots.slice();
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return { ...current, slots: next };
    });
  }, []);

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

  const [persistentColor, setPersistentColor] = useState<string | null>(null);

  useEffect(() => {
    if (activeColor) setPersistentColor(activeColor);
  }, [activeColor]);

  // Dynamic Font Loading
  useEffect(() => {
    const familiesNeeded = new Set<string>();
    // Current pairing
    pairing.slots.forEach(s => familiesNeeded.add(s.family));
    // Pre-load buffer
    buffer.forEach(p => p.slots.forEach(s => familiesNeeded.add(s.family)));
    // Saved pairings
    saved.forEach(item => item.snapshot.slots.forEach(s => familiesNeeded.add(s.family)));

    const newFamilies = Array.from(familiesNeeded).filter(f => !loadedFontsRef.current.has(f));
    if (newFamilies.length === 0) return;

    // Inject individual links for each new family
    newFamilies.forEach(family => {
      const url = buildUrlForFamilies([family]);
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      document.head.appendChild(link);
      loadedFontsRef.current.add(family);
    });
  }, [pairing, buffer, saved]);

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
            setViewMode={(newMode) => {
              if ((newMode === "vertical" || newMode === "scroll") && !autoCloseRef.current) {
                setPanelOpen(false);
                autoCloseRef.current = true;
              }
              setViewMode(newMode);
            }}
            vibe={pairing.vibe}
            isDark={isDark}
            onRoll={roll}
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
            activeColor={persistentColor}
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
              onAddSlot={addSlot}
              onRemoveSlot={removeSlot}
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
              onAddSlot={addSlot}
              onRemoveSlot={removeSlot}
              onReorderSlots={reorderSlots}
              setPanelOpen={setPanelOpen}
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
        roles={pairing.slots.map((s) => s.role)}
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
  const fontFamilyEntries = p.slots
    .map((s) => `        ${s.role.padEnd(11, " ")} ${fam(s.family)},`)
    .join("\n");
  const googleFamilies = p.slots
    .map((s) => `family=${fontUrl(s.family)}:wght@400;500;600;700`)
    .join("&");
  return `// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
${fontFamilyEntries}
      },
    },
  },
} satisfies Config;

// Load via Google Fonts:
// https://fonts.googleapis.com/css2?${googleFamilies}&display=swap
`;
}
