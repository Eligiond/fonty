import { useEffect } from "react";

type ShortcutArgs = {
  roll: () => void;
  setPanelOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  setSettingsOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

export function useKeyboardShortcuts({
  roll,
  setPanelOpen,
  setSettingsOpen,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: ShortcutArgs) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const inEditable =
        !!t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable);

      // Space: Roll (using e.code for physical key detection)
      if (e.code === "Space") {
        if (inEditable) return;
        e.preventDefault();
        e.stopPropagation();
        roll();
        return;
      }

      // Arrow keys: step back / forward through history (redo only — no new pairing)
      if (e.code === "ArrowLeft") {
        if (inEditable) return;
        if (!canUndo) return;
        e.preventDefault();
        e.stopPropagation();
        onUndo();
        return;
      }
      if (e.code === "ArrowRight") {
        if (inEditable) return;
        if (!canRedo) return;
        e.preventDefault();
        e.stopPropagation();
        onRedo();
        return;
      }

      // Meta/Ctrl shortcuts
      const cmd = e.metaKey || e.ctrlKey;
      if (cmd) {
        if (e.key === ".") {
          e.preventDefault();
          setPanelOpen((v) => !v);
        }
        if (e.key === "i" || e.key === "I") {
          e.preventDefault();
          setSettingsOpen((v) => !v);
        }
      }
    };

    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [roll, setPanelOpen, setSettingsOpen, onUndo, onRedo, canUndo, canRedo]);
}
