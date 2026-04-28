import { useEffect } from "react";

type ShortcutArgs = {
  roll: () => void;
  setPanelOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  setSettingsOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
};

export function useKeyboardShortcuts({ roll, setPanelOpen, setSettingsOpen }: ShortcutArgs) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Space: Roll (using e.code for physical key detection)
      if (e.code === "Space" && !e.repeat) {
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
        e.stopPropagation();
        roll();
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
  }, [roll, setPanelOpen, setSettingsOpen]);
}
