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
    id: "cream",
    name: "Cream",
    swatch: "#e7e3d7",
    light: {
      bg: "#fafaf7",
      surface: "#f4f1ea",
      surfaceMuted: "#ebe8df",
      border: "#e5e2d8",
      text: "#1a1a18",
      textMuted: "#6b6856",
      stripe1: "#fafaf7",
      stripe2: "#f1efe8",
      stripe3: "#e7e3d7",
      accent: "#1a1a18",
      accentText: "#fafaf7",
    },
    dark: {
      bg: "#15140f",
      surface: "#1f1e18",
      surfaceMuted: "#28261e",
      border: "#3d3b2e",
      text: "#f4f1ea",
      textMuted: "#9a9684",
      stripe1: "#15140f",
      stripe2: "#1d1c16",
      stripe3: "#25231c",
      accent: "#f4f1ea",
      accentText: "#15140f",
    },
  },
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
      accent: "#0a0a0a",
      accentText: "#ffffff",
    },
    dark: {
      bg: "#0a0a0a",
      surface: "#161616",
      surfaceMuted: "#202020",
      border: "#363636",
      text: "#f5f5f5",
      textMuted: "#aaaaaa",
      stripe1: "#0a0a0a",
      stripe2: "#131313",
      stripe3: "#1c1c1c",
      accent: "#f5f5f5",
      accentText: "#0a0a0a",
    },
  },
  {
    id: "sage",
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
      accent: "#1c2118",
      accentText: "#f5f7f2",
    },
    dark: {
      bg: "#11140f",
      surface: "#191d16",
      surfaceMuted: "#21261d",
      border: "#333a2c",
      text: "#e9eee3",
      textMuted: "#8e9b86",
      stripe1: "#11140f",
      stripe2: "#171b14",
      stripe3: "#1e221a",
      accent: "#e9eee3",
      accentText: "#11140f",
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
      accent: "#171c24",
      accentText: "#f3f5f8",
    },
    dark: {
      bg: "#0f1218",
      surface: "#161b23",
      surfaceMuted: "#1e242e",
      border: "#2e3a48",
      text: "#e7ecf2",
      textMuted: "#8e9baf",
      stripe1: "#0f1218",
      stripe2: "#141820",
      stripe3: "#1a1f28",
      accent: "#e7ecf2",
      accentText: "#0f1218",
    },
  },
  {
    id: "ochre",
    name: "Ochre",
    swatch: "#e8c89a",
    light: {
      bg: "#faf6ee",
      surface: "#f1ebde",
      surfaceMuted: "#e6dec9",
      border: "#d8cfb7",
      text: "#26200f",
      textMuted: "#7a6d4d",
      stripe1: "#faf6ee",
      stripe2: "#f0e9d6",
      stripe3: "#e3d8b9",
      accent: "#26200f",
      accentText: "#faf6ee",
    },
    dark: {
      bg: "#16130a",
      surface: "#201c11",
      surfaceMuted: "#2a2517",
      border: "#3e3626",
      text: "#f0e9d6",
      textMuted: "#aa9c78",
      stripe1: "#16130a",
      stripe2: "#1c180f",
      stripe3: "#231e14",
      accent: "#f0e9d6",
      accentText: "#16130a",
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
    ["--accent" as string]: p.accent,
    ["--accent-text" as string]: p.accentText,
  } as React.CSSProperties;
}
