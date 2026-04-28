import { useState, useEffect } from "react";
import type { FontPairing, FontSlot } from "@/lib/fonts";
import type { SavedItem } from "@/components/SidePanel";

const STORAGE_KEY = "fonty:saved";

// Coerce legacy {heading,subheading,body} snapshots into the new slots-based shape.
function migrateSnapshot(snap: any): FontPairing | null {
  if (!snap || typeof snap !== "object") return null;
  if (Array.isArray(snap.slots)) {
    return {
      id: snap.id ?? `migrated-${Date.now()}`,
      vibe: snap.vibe ?? "Classic",
      slots: snap.slots as FontSlot[],
    };
  }
  if (snap.heading && snap.subheading && snap.body) {
    return {
      id: snap.id ?? `migrated-${Date.now()}`,
      vibe: snap.vibe ?? "Classic",
      slots: [
        { role: "heading", family: String(snap.heading) },
        { role: "subheading", family: String(snap.subheading) },
        { role: "body", family: String(snap.body) },
      ],
    };
  }
  return null;
}

export function useSavedPairings(pairing: FontPairing) {
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [activeSavedId, setActiveSavedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const flatten = (nodes: any[]): SavedItem[] => {
          const items: SavedItem[] = [];
          for (const n of nodes) {
            if (n.type === "item") {
              const snapshot = migrateSnapshot(n.snapshot);
              if (!snapshot) continue;
              items.push({
                type: "item",
                id: n.id,
                name: n.name,
                snapshot,
                timestamp: n.timestamp || Date.now(),
                color: n.color ?? null,
              });
            } else if (n.type === "folder" && Array.isArray(n.items)) {
              items.push(...flatten(n.items));
            }
          }
          return items;
        };
        setSaved(flatten(parsed));
      }
    } catch {}
  }, []);

  const persistSaved = (next: SavedItem[]) => {
    setSaved(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const onConfirmSave = (name: string, description: string) => {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    
    const item: SavedItem = {
        type: "item",
        id,
        name,
        snapshot: { ...pairing, slots: pairing.slots.map((s) => ({ ...s })) },
        timestamp: Date.now(),
    };
    persistSaved([item, ...saved]);
    setActiveSavedId(id);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
    return id;
  };

  const renameSaved = (id: string, name: string) => {
    persistSaved(saved.map((item) => item.id === id ? { ...item, name } : item));
  };

  const deleteSaved = (id: string) => {
    persistSaved(saved.filter((item) => item.id !== id));
    if (activeSavedId === id) setActiveSavedId(null);
  };

  const setSavedColor = (id: string, color: string | null) => {
    persistSaved(saved.map((item) => item.id === id ? { ...item, color } : item));
  };

  const loadSaved = (item: SavedItem, setPairing: (p: FontPairing) => void) => {
    setPairing(item.snapshot);
    setActiveSavedId(item.id);
  };

  return {
    saved,
    activeSavedId, setActiveSavedId,
    copied, setCopied,
    justSaved, setJustSaved,
    onConfirmSave,
    renameSaved,
    deleteSaved,
    setSavedColor,
    loadSaved,
  };
}
