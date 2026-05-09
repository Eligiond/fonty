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

export function buildHtmlExport(
  pairing: FontPairing,
  texts: { heading: string; subheading: string; body: string; caption: string },
): string {
  const families = pairing.slots
    .map((s) => `family=${s.family.replace(/\s+/g, "+")}:wght@400;500;600;700`)
    .join("&");
  const has = (role: FontRole) => pairing.slots.some((s) => s.role === role);
  const fam = (role: FontRole) => {
    const slot = pairing.slots.find((s) => s.role === role);
    return slot ? `"${slot.family}", system-ui, sans-serif` : "system-ui, sans-serif";
  };
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(pairing.vibe || "Fontfun pairing")}</title>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?${families}&display=swap" rel="stylesheet" />
    <style>
      :root {
        --font-heading:    ${fam("heading")};
        --font-subheading: ${fam("subheading")};
        --font-body:       ${fam("body")};
        --font-caption:    ${fam("caption")};
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 64px 24px;
        font-family: var(--font-body);
        color: #111;
        background: #fff;
        line-height: 1.5;
      }
      .stack { max-width: 720px; margin: 0 auto; display: grid; gap: 28px; }
      h1 { font-family: var(--font-heading);    font-size: clamp(36px, 6vw, 64px); line-height: 1.05; margin: 0; font-weight: 700; }
      h3 { font-family: var(--font-subheading); font-size: clamp(20px, 3vw, 28px); line-height: 1.2; margin: 0; font-weight: 600; }
      p  { font-family: var(--font-body);       font-size: 18px; margin: 0; }
      .caption { font-family: var(--font-caption); font-size: 13px; opacity: 0.65; }
    </style>
  </head>
  <body>
    <main class="stack">
      ${has("heading") ? `<h1>${escapeHtml(texts.heading)}</h1>` : ""}
      ${has("subheading") ? `<h3>${escapeHtml(texts.subheading)}</h3>` : ""}
      ${has("body") ? `<p>${escapeHtml(texts.body)}</p>` : ""}
      ${has("caption") ? `<p class="caption">${escapeHtml(texts.caption)}</p>` : ""}
    </main>
  </body>
</html>
`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
