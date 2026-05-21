"use client";

import type { FontPairing, FontRole } from "./fonts";
import type { Texts } from "@/components/GenerateView";

const ROLE_ORDER: FontRole[] = ["heading", "subheading", "body", "caption"];

const ROLE_LABEL: Record<FontRole, string> = {
  heading: "Heading",
  subheading: "Subheading",
  body: "Body",
  caption: "Caption",
};

// A single line that exercises every letter of the alphabet — the closing
// sample on each specimen page, set in the font itself.
const PANGRAM = "The quick brown fox jumps over the lazy dog";

// Character set, broken into even lines so it reads as a calm block rather
// than one long unbroken string. Numerals/punctuation close it out.
const CHAR_LINES = [
  "abcdefghijkl",
  "mnopqrstuvwxyz",
  "ABCDEFGHIJKLM",
  "NOPQRSTUVWXYZ",
];
const NUMERAL_LINE = "1234567890!@#$%&*(){}+?";

function fontSlug(family: string): string {
  return family
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// PascalCase the family name without spaces. Preserves all-caps segments
// (IBM, DM, etc.) as-is, since that's how the Expo packages name them.
function pascalName(family: string): string {
  return family
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) =>
      /^[A-Z0-9]+$/.test(part) ? part : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join("");
}

// @expo-google-fonts publishes the actual TTF files for every Google Font on
// npm; jsdelivr serves them with CORS enabled. @react-pdf needs TTF, not
// woff2, so this is the only reliable source we can use from the browser.
function googleFontTtfUrl(family: string, weight: 400 | 700): string {
  const slug = fontSlug(family);
  const name = pascalName(family);
  const style = weight === 700 ? "Bold" : "Regular";
  // Path pattern: {slug}/{weight}{Style}/{PascalName}_{weight}{Style}.ttf
  return `https://cdn.jsdelivr.net/npm/@expo-google-fonts/${slug}/${weight}${style}/${name}_${weight}${style}.ttf`;
}

// jsdelivr returns 200 with `text/plain` "Couldn't find ..." stubs when a
// file is missing. Treat anything that isn't a binary font response as gone.
async function urlExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD", mode: "cors" });
    if (!res.ok) return false;
    const ct = res.headers.get("content-type") || "";
    if (ct.startsWith("text/")) return false;
    const len = parseInt(res.headers.get("content-length") || "0", 10);
    if (len > 0 && len < 1000) return false;
    return true;
  } catch {
    return false;
  }
}

export async function generateSpecimenPdf(
  pairing: FontPairing,
  _texts: Texts,
  _accent?: string | null,
): Promise<Blob> {
  const [{ Document, Page, Text, View, StyleSheet, Font, pdf }] = await Promise.all([
    import("@react-pdf/renderer"),
  ]);

  const uniqueFamilies = Array.from(new Set(pairing.slots.map((s) => s.family)));

  // Probe each font URL before registering so a missing font doesn't poison
  // the whole render. Anything that fails the probe is dropped from the
  // registry — PDF falls back to Helvetica for that family.
  const registered = new Set<string>();
  await Promise.all(
    uniqueFamilies.map(async (family) => {
      const url400 = googleFontTtfUrl(family, 400);
      const url700 = googleFontTtfUrl(family, 700);
      const [ok400, ok700] = await Promise.all([urlExists(url400), urlExists(url700)]);
      if (!ok400 && !ok700) return;
      const fonts: { src: string; fontWeight: number }[] = [];
      if (ok400) fonts.push({ src: url400, fontWeight: 400 });
      if (ok700) fonts.push({ src: url700, fontWeight: 700 });
      try {
        Font.register({ family, fonts });
        registered.add(family);
      } catch {
        // skip — fall back to Helvetica
      }
    }),
  );
  Font.registerHyphenationCallback((word) => [word]);

  // Resolve the font stack at render time: registered families use their
  // family name; unregistered ones fall back to Helvetica.
  const resolveFamily = (family: string): string =>
    registered.has(family) ? family : "Helvetica";

  const dateLabel = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const styles = StyleSheet.create({
    coverPage: {
      flexDirection: "column",
      paddingVertical: 52,
      paddingHorizontal: 64,
      backgroundColor: "#ffffff",
      color: "#111111",
    },
    specimenPage: {
      flexDirection: "column",
      paddingVertical: 48,
      paddingHorizontal: 64,
      backgroundColor: "#ffffff",
      color: "#111111",
    },
    eyebrow: {
      fontSize: 9,
      letterSpacing: 2.6,
      color: "#9a9a9a",
      textTransform: "uppercase",
    },
    // — Cover —
    coverTitle: {
      fontSize: 76,
      // Generous leading so deep descenders never crowd the date below it,
      // whatever heading font the pairing happens to land on.
      lineHeight: 1.15,
      color: "#111111",
      marginBottom: 34,
    },
    coverDate: {
      fontSize: 17,
      letterSpacing: 0.2,
      color: "#555555",
    },
    coverSite: {
      fontSize: 12,
      letterSpacing: 0.5,
      color: "#9a9a9a",
      textAlign: "right",
    },
    // — Specimen —
    specimenName: {
      fontSize: 50,
      lineHeight: 1.1,
      color: "#111111",
      marginTop: 9,
    },
    charSection: {
      marginTop: 44,
    },
    charLine: {
      fontSize: 21,
      lineHeight: 1.46,
      color: "#1a1a1a",
    },
    sampleSection: {
      marginTop: 50,
    },
    sampleText: {
      fontSize: 30,
      lineHeight: 1.3,
      color: "#111111",
    },
    specimenFooter: {
      position: "absolute",
      bottom: 30,
      left: 64,
      right: 64,
      flexDirection: "row",
      justifyContent: "space-between",
      fontSize: 8,
      letterSpacing: 1.4,
      color: "#b0b0b0",
      textTransform: "uppercase",
    },
    footerBrand: {
      color: "#6e6e6e",
    },
  });

  // One specimen page per role, in a stable order.
  const slots = ROLE_ORDER.flatMap((role) =>
    pairing.slots.filter((s) => s.role === role),
  );

  const headingSlot = slots.find((s) => s.role === "heading") ?? slots[0];
  const coverTitleFamily = headingSlot
    ? resolveFamily(headingSlot.family)
    : "Helvetica";

  const Doc = (
    <Document title={`${pairing.vibe || "Fontfun"} typeset kit`} author="Fontfun">
      {/* Cover — title + date sit in the upper-middle, site stays bottom-right */}
      <Page size="A4" orientation="landscape" style={styles.coverPage}>
        <Text style={styles.eyebrow}>FONTFUN · TYPESET</Text>
        <View style={{ flexGrow: 2.2 }} />
        <View>
          <Text
            style={[
              styles.coverTitle,
              { fontFamily: coverTitleFamily, fontWeight: 700 },
            ]}
          >
            Typeset kit
          </Text>
          <Text style={styles.coverDate}>{dateLabel}</Text>
        </View>
        <View style={{ flexGrow: 1 }} />
        <Text style={styles.coverSite}>fontfun.co</Text>
      </Page>

      {/* One landscape specimen page per font */}
      {slots.map((slot) => {
        const ff = resolveFamily(slot.family);
        return (
          <Page
            key={`${slot.role}-${slot.family}`}
            size="A4"
            orientation="landscape"
            style={styles.specimenPage}
          >
            <Text style={styles.eyebrow}>
              {ROLE_LABEL[slot.role].toUpperCase()}
            </Text>
            <Text
              style={[styles.specimenName, { fontFamily: ff, fontWeight: 700 }]}
            >
              {slot.family}
            </Text>

            {/* Character set — even lines, uniform leading throughout */}
            <View style={styles.charSection}>
              {CHAR_LINES.map((line) => (
                <Text key={line} style={[styles.charLine, { fontFamily: ff }]}>
                  {line}
                </Text>
              ))}
              <Text style={[styles.charLine, { fontFamily: ff }]}>
                {NUMERAL_LINE}
              </Text>
            </View>

            {/* Sample — the pangram, set in the font itself */}
            <View style={styles.sampleSection}>
              <Text style={[styles.sampleText, { fontFamily: ff }]}>
                {PANGRAM}
              </Text>
            </View>

            <View style={styles.specimenFooter} fixed>
              <Text>{ROLE_LABEL[slot.role]} Font</Text>
              <Text style={styles.footerBrand}>Generated with fontfun.co</Text>
            </View>
          </Page>
        );
      })}
    </Document>
  );

  const blob = await pdf(Doc).toBlob();
  return blob;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
