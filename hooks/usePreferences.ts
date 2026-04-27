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
  const [viewMode, setViewMode] = useState<ViewMode>("vertical");
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
        }
        const validModes: ViewMode[] = ["vertical", "horizontal", "scroll"];
        if (prefs.viewMode && validModes.includes(prefs.viewMode)) {
          setViewMode(prefs.viewMode);
        } else if (prefs.tab === "scroll") {
          setViewMode("scroll");
        }
        if (prefs.mockupOffsets) setMockupOffsets(prefs.mockupOffsets);
        if (prefs.mockupWidths) {
          // Legacy values were stored in pixels (>1); fractions are 0..1.
          // If any value is > 1, ignore the persisted state and keep the new fractional defaults.
          const allFractional = Object.values(prefs.mockupWidths).every(
            (v: any) => typeof v === "number" && v > 0 && v <= 1,
          );
          if (allFractional) setMockupWidths(prefs.mockupWidths);
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
          viewMode,
          mockupOffsets, mockupWidths,
        }),
      );
    } catch {}
  }, [themeId, isDark, panelOpen, panelTab, panelWidth, viewMode, mockupOffsets, mockupWidths]);

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
