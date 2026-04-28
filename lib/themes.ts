export type ColorPalette = {
  bg: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  text: string;
  textMuted: string;
  stripe1: string;
  stripe2: string;
  stripe3: string;
  stripe4: string;
  accent: string;
  accentText: string;
};

export type Theme = {
  id: string;
  name: string;
  swatch: string;
  light: ColorPalette;
  dark: ColorPalette;
};

export type ThemeId = (typeof THEMES)[number]["id"];

export const THEMES = [
  {
    id: "blanc",
    name: "Blanc",
    swatch: "#ffffff",
    light: {
      bg: "#ffffff",
      surface: "#f7f7f7",
      surfaceMuted: "#efefef",
      border: "#e6e6e6",
      text: "#0a0a0a",
      textMuted: "#737373",
      stripe1: "#ffffff",
      stripe2: "#f5f5f5",
      stripe3: "#ededed",
      stripe4: "#e3e3e3",
      accent: "#0a0a0a",
      accentText: "#ffffff",
    },
    dark: {
      bg: "#050505",
      surface: "#121212",
      surfaceMuted: "#1a1a1a",
      border: "#2a2a2a",
      text: "#f5f5f5",
      textMuted: "#888888",
      stripe1: "#050505",
      stripe2: "#0f0f0f",
      stripe3: "#181818",
      stripe4: "#1f1f1f",
      accent: "#f5f5f5",
      accentText: "#050505",
    },
  },
  {
    id: "slate",
    name: "Slate",
    swatch: "#c4ced8",
    light: {
      bg: "#f3f5f8",
      surface: "#e9edf2",
      surfaceMuted: "#dde3eb",
      border: "#cfd6e0",
      text: "#171c24",
      textMuted: "#5a6577",
      stripe1: "#f3f5f8",
      stripe2: "#e7ecf2",
      stripe3: "#dae1e9",
      stripe4: "#ccd5e0",
      accent: "#171c24",
      accentText: "#f3f5f8",
    },
    dark: {
      bg: "#080a0e",
      surface: "#0f131a",
      surfaceMuted: "#161c26",
      border: "#242e3a",
      text: "#e7ecf2",
      textMuted: "#7a8ba3",
      stripe1: "#080a0e",
      stripe2: "#0d1016",
      stripe3: "#13171e",
      stripe4: "#1a1f28",
      accent: "#e7ecf2",
      accentText: "#080a0e",
    },
  },
  {
    id: "stunning",
    name: "Sage",
    swatch: "#c8d4c2",
    light: {
      bg: "#f5f7f2",
      surface: "#ebefe6",
      surfaceMuted: "#dde3d6",
      border: "#cfd6c7",
      text: "#1c2118",
      textMuted: "#5d6a55",
      stripe1: "#f5f7f2",
      stripe2: "#e9eee3",
      stripe3: "#dde4d4",
      stripe4: "#d0d9c5",
      accent: "#1c2118",
      accentText: "#f5f7f2",
    },
    dark: {
      bg: "#0e110d",
      surface: "#151a14",
      surfaceMuted: "#1c231a",
      border: "#2c3628",
      text: "#e9eee3",
      textMuted: "#7e8c75",
      stripe1: "#0e110d",
      stripe2: "#131812",
      stripe3: "#1a2018",
      stripe4: "#21281f",
      accent: "#e9eee3",
      accentText: "#0e110d",
    },
  },
] as const satisfies readonly Theme[];

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function paletteToCssVars(p: ColorPalette): React.CSSProperties {
  return {
    ["--bg" as string]: p.bg,
    ["--surface" as string]: p.surface,
    ["--surface-muted" as string]: p.surfaceMuted,
    ["--border" as string]: p.border,
    ["--text" as string]: p.text,
    ["--text-muted" as string]: p.textMuted,
    ["--stripe-1" as string]: p.stripe1,
    ["--stripe-2" as string]: p.stripe2,
    ["--stripe-3" as string]: p.stripe3,
    ["--stripe-4" as string]: p.stripe4,
    ["--accent" as string]: p.accent,
    ["--accent-text" as string]: p.accentText,
  } as React.CSSProperties;
}
