export type FontRole = "heading" | "subheading" | "body";

export type FontPairing = {
  id: string;
  vibe: string;
  heading: string;
  subheading: string;
  body: string;
};

// --- Categorized pools for dynamic pairing ---

const HEADING_SERIFS = [
  "Playfair Display", "DM Serif Display", "Fraunces", "Cormorant Garamond",
  "Libre Caslon Display", "EB Garamond", "Bodoni Moda", "Crimson Pro",
  "Lora", "Tenor Sans", "Merriweather",
];

const HEADING_DISPLAY_SANS = [
  "Syne", "Bricolage Grotesque", "Space Grotesk", "Archivo",
  "Rubik", "Raleway", "Montserrat",
];

const SUBHEADING_GEOMETRIC = [
  "DM Sans", "Outfit", "Plus Jakarta Sans", "Manrope", "Nunito", "Poppins", "Montserrat",
];

const SUBHEADING_HUMANIST = [
  "Inter", "Source Sans 3", "Work Sans", "Open Sans",
  "Lato", "Karla", "Roboto", "Montserrat", "Libre Franklin",
];

const BODY_READABLE = [
  "Inter", "Source Sans 3", "Work Sans", "Open Sans",
  "Lato", "Karla", "Roboto", "Libre Franklin", "Archivo Narrow", "Montserrat",
];

const BODY_MONO = ["IBM Plex Mono"];

const FONT_VIBES: Record<string, string> = {
  "Playfair Display": "Editorial",
  "DM Serif Display": "Geometric",
  "Fraunces": "Warm Modern",
  "Cormorant Garamond": "Luxury",
  "Libre Caslon Display": "Classical",
  "EB Garamond": "Timeless",
  "Bodoni Moda": "Fashion",
  "Crimson Pro": "Long-form",
  "Lora": "Approachable",
  "Tenor Sans": "Boutique",
  "Merriweather": "Trustworthy",
  "Syne": "Bold Studio",
  "Bricolage Grotesque": "Expressive",
  "Space Grotesk": "Next-gen pairing",
  "Archivo": "Newsroom",
  "Rubik": "Playful",
  "Raleway": "Elegant",
  "Montserrat": "Modernist",
  "Karla": "Functional",
};

export const ALL_POOL_FONTS: string[] = Array.from(new Set([
  ...HEADING_SERIFS,
  ...HEADING_DISPLAY_SANS,
  ...SUBHEADING_GEOMETRIC,
  ...SUBHEADING_HUMANIST,
  ...BODY_READABLE,
  ...BODY_MONO,
  "Space Grotesk",
  "Montserrat",
  "Karla",
]));

// Curated starting pairings — all three fonts are distinct per row
export const FONT_PAIRINGS: FontPairing[] = [
  { id: "fonty-default",      vibe: "Next-gen pairing", heading: "Space Grotesk",        subheading: "Montserrat",        body: "Karla" },
  { id: "editorial-classic",  vibe: "Editorial",      heading: "Playfair Display",     subheading: "Source Sans 3",     body: "Lato" },
  { id: "modern-saas",        vibe: "Modern SaaS",    heading: "Syne",                  subheading: "Inter",             body: "Open Sans" },
  { id: "dm-system",          vibe: "Geometric",      heading: "DM Serif Display",      subheading: "DM Sans",           body: "Source Sans 3" },
  { id: "fraunces-inter",     vibe: "Warm Modern",    heading: "Fraunces",              subheading: "Inter",             body: "Karla" },
  { id: "bricolage",          vibe: "Expressive",     heading: "Bricolage Grotesque",   subheading: "DM Sans",           body: "Inter" },
  { id: "techy-mono",         vibe: "Tech / Crypto",  heading: "Space Grotesk",         subheading: "Outfit",            body: "IBM Plex Mono" },
  { id: "luxury-cormorant",   vibe: "Luxury",         heading: "Cormorant Garamond",    subheading: "Montserrat",        body: "Lato" },
  { id: "manrope-jakarta",    vibe: "Friendly Tech",  heading: "Manrope",               subheading: "Plus Jakarta Sans", body: "Inter" },
  { id: "syne-worksans",      vibe: "Bold Studio",    heading: "Syne",                  subheading: "Work Sans",         body: "Karla" },
  { id: "rubik-nunito",       vibe: "Playful",        heading: "Rubik",                 subheading: "Nunito",            body: "Karla" },
  { id: "tenor-karla",        vibe: "Boutique",       heading: "Tenor Sans",            subheading: "Karla",             body: "Libre Franklin" },
  { id: "bodoni-montserrat",  vibe: "Fashion",        heading: "Bodoni Moda",           subheading: "Montserrat",        body: "Lato" },
];


const WEIGHTS = "wght@300;400;500;600;700;800;900";
const encodeFamily = (family: string) =>
  `family=${family.replace(/\s+/g, "+")}:${WEIGHTS}`;

export function buildAllFontsUrl(): string {
  const params = ALL_POOL_FONTS.map(encodeFamily).join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

export const cssFamily = (family: string) => `"${family}", system-ui, sans-serif`;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickExcluding<T>(arr: T[], ...exclude: T[]): T {
  const pool = arr.filter((x) => !exclude.includes(x));
  return pool.length > 0 ? pick(pool) : pick(arr);
}

export function pickRandomPairing(_excludeId?: string): FontPairing {
  const allHeadings = [...HEADING_SERIFS, ...HEADING_DISPLAY_SANS];
  const heading = pick(allHeadings);

  const useMono =
    HEADING_DISPLAY_SANS.includes(heading) && Math.random() < 0.2;

  const allSub = [...SUBHEADING_GEOMETRIC, ...SUBHEADING_HUMANIST];
  const subheading = pickExcluding(allSub, heading);

  const bodyPool = useMono
    ? BODY_MONO
    : BODY_READABLE.filter((f) => f !== heading && f !== subheading);
  const body = pick(bodyPool.length > 0 ? bodyPool : BODY_READABLE);

  const vibe = FONT_VIBES[heading] ?? "Classic";
  const id = `roll-${Date.now()}`;

  return { id, vibe, heading, subheading, body };
}
