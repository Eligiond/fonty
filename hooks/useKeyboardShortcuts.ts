import { useEffect } from "react";

type ShortcutArgs = {
  roll: () => void;
  setPanelOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  setSettingsOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
};

export function useKeyboardShortcuts({ roll, setPanelOpen, setSettingsOpen }: ShortcutArgs) {
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const cmd = e.metaKey || e.ctrlKey;
      if (!cmd) return;
      if (e.key === ".") {
        e.preventDefault();
        setPanelOpen((v) => !v);
      }
      if (e.key === "i" || e.key === "I") {
        e.preventDefault();
        setSettingsOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setPanelOpen, setSettingsOpen]);
}
