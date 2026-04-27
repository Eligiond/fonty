import { useState, useEffect } from "react";
import type { FontPairing } from "@/lib/fonts";
import type { SavedItem } from "@/components/SidePanel";

const STORAGE_KEY = "fonty:saved";

export function useSavedPairings(pairing: FontPairing) {
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [activeSavedId, setActiveSavedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Hydrate
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const migrate = (nodes: any[]): SavedItem[] => {
          const items: SavedItem[] = [];
          for (const n of nodes) {
            if (n.type === "item") {
              items.push({ ...n, timestamp: n.timestamp || Date.now() } as SavedItem);
            } else if (n.type === "folder" && Array.isArray(n.items)) {
              items.push(...migrate(n.items));
            }
          }
          return items;
        };
        setSaved(migrate(parsed));
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
        snapshot: { ...pairing },
        timestamp: Date.now()
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
