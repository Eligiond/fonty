import type { FontPairing, FontRole } from "./fonts";

export function buildShareUrl(pairing: FontPairing, color?: string | null): string {
  const fonts = pairing.slots
    .map((s) => `${s.role}:${s.family.replace(/\s+/g, "+")}`)
    .join(",");
  const params = new URLSearchParams();
  params.set("fonts", fonts);
  if (pairing.vibe) params.set("vibe", pairing.vibe);
  if (color) params.set("color", color.replace(/^#/, ""));
  const base =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}`
      : "";
  return `${base}?${params.toString()}`;
}

export function parseShareUrl(
  search: string,
): { slots: { role: FontRole; family: string }[]; vibe?: string; color?: string | null } | null {
  const params = new URLSearchParams(search);
  const fonts = params.get("fonts");
  if (!fonts) return null;
  const slots = fonts
    .split(",")
    .map((entry) => {
      const [role, raw] = entry.split(":");
      if (!role || !raw) return null;
      const family = raw.replace(/\+/g, " ");
      return { role: role as FontRole, family };
    })
    .filter((x): x is { role: FontRole; family: string } => Boolean(x));
  if (slots.length === 0) return null;
  const vibe = params.get("vibe") ?? undefined;
  const colorRaw = params.get("color");
  const color = colorRaw ? `#${colorRaw}` : null;
  return { slots, vibe, color };
}

export function buildCssSnippet(pairing: FontPairing): string {
  const families = pairing.slots
    .map((s) => `family=${s.family.replace(/\s+/g, "+")}:wght@400;500;600;700`)
    .join("&");
  const importLine = `@import url("https://fonts.googleapis.com/css2?${families}&display=swap");`;
  const vars = pairing.slots
    .map((s) => `  --font-${s.role}: "${s.family}", system-ui, sans-serif;`)
    .join("\n");
  const usage = pairing.slots
    .map((s) => `${roleSelector(s.role)} { font-family: var(--font-${s.role}); }`)
    .join("\n");
  return `${importLine}\n\n:root {\n${vars}\n}\n\n${usage}\n`;
}

function roleSelector(role: FontRole): string {
  switch (role) {
    case "heading":
      return "h1, h2";
    case "subheading":
      return "h3, h4";
    case "body":
      return "p, body";
    case "caption":
      return ".caption, small";
  }
}

export function buildJsonExport(pairing: FontPairing): string {
  const payload = {
    vibe: pairing.vibe,
    slots: pairing.slots.map((s) => ({ role: s.role, family: s.family })),
  };
  return JSON.stringify(payload, null, 2);
}

export function buildTailwindConfig(p: FontPairing): string {
  const fam = (name: string) => `['${name}', 'system-ui', 'sans-serif']`;
  const fontFamilyEntries = p.slots
    .map((s) => `        ${s.role.padEnd(11, " ")} ${fam(s.family)},`)
    .join("\n");
  const googleFamilies = p.slots
    .map((s) => `family=${s.family.replace(/\s+/g, "+")}:wght@400;500;600;700`)
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
