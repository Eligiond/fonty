import { useState, useEffect } from "react";
import type { ThemeId } from "@/lib/themes";
import type { ViewMode } from "@/components/TopBar";
import {
  PANEL_DEFAULT,
  PANEL_MIN,
  PANEL_MAX,
  type PanelTab,
} from "@/components/SidePanel";

const PREFS_KEY = "fonty:prefs";

export function usePreferences() {
  const [themeId, setThemeId] = useState<ThemeId>("blanc");
  const [isDark, setIsDark] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [panelTab, setPanelTab] = useState<PanelTab>("adjust");
  const [panelWidth, setPanelWidth] = useState(PANEL_DEFAULT);
  const [viewMode, setViewMode] = useState<ViewMode>("horizontal");
  const [mockupOffsets, setMockupOffsets] = useState<Record<string, number>>({
    heading: 0,
    subheading: 0,
    body: 0,
  });
  const [mockupWidths, setMockupWidths] = useState<Record<string, number>>({
    heading: 0.66,
    subheading: 0.66,
    body: 0.66,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) {
        const prefs = JSON.parse(raw);
        if (prefs.themeId) setThemeId(prefs.themeId);
        if (typeof prefs.isDark === "boolean") setIsDark(prefs.isDark);
        if (typeof prefs.panelOpen === "boolean") setPanelOpen(prefs.panelOpen);
        if (prefs.panelTab === "saved" || prefs.panelTab === "adjust") {
          setPanelTab(prefs.panelTab);
        }
        if (typeof prefs.panelWidth === "number") {
          setPanelWidth(Math.max(PANEL_MIN, Math.min(PANEL_MAX, prefs.panelWidth)));
        } else {
          // Default to the height of a standard stripe in horizontal view: (H - pt-8) / 4.15
          const calculatedWidth = Math.round((window.innerHeight - 32) / 4.15);
          setPanelWidth(Math.max(PANEL_MIN, Math.min(PANEL_MAX, calculatedWidth)));
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        PREFS_KEY,
        JSON.stringify({
          themeId, isDark,
          panelOpen, panelTab, panelWidth,
        }),
      );
    } catch {}
  }, [themeId, isDark, panelOpen, panelTab, panelWidth]);

  return {
    themeId, setThemeId,
    isDark, setIsDark,
    panelOpen, setPanelOpen,
    panelTab, setPanelTab,
    panelWidth, setPanelWidth,
    viewMode, setViewMode,
    mockupOffsets, setMockupOffsets,
    mockupWidths, setMockupWidths,
  };
}
