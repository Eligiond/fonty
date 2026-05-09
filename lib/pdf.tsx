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

const ROLE_SAMPLE_SIZE: Record<FontRole, number> = {
  heading: 36,
  subheading: 22,
  body: 13,
  caption: 10,
};

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
  texts: Texts,
  accent?: string | null,
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

  const accentColor = accent ?? "#111111";

  const styles = StyleSheet.create({
    page: {
      paddingTop: 56,
      paddingBottom: 56,
      paddingHorizontal: 64,
      backgroundColor: "#ffffff",
      color: "#111111",
    },
    coverHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 48,
    },
    coverEyebrow: {
      fontSize: 8,
      letterSpacing: 2,
      color: "#888888",
      textTransform: "uppercase",
    },
    coverVibe: {
      fontSize: 8,
      letterSpacing: 2,
      color: accentColor,
      textTransform: "uppercase",
    },
    coverTitle: {
      fontSize: 28,
      lineHeight: 1.1,
      marginBottom: 32,
      color: "#111111",
    },
    coverDivider: {
      height: 2,
      backgroundColor: accentColor,
      width: 48,
      marginBottom: 48,
    },
    sampleBlock: {
      marginBottom: 28,
    },
    sampleMeta: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    sampleRole: {
      fontSize: 7,
      letterSpacing: 1.5,
      color: "#888888",
      textTransform: "uppercase",
      marginRight: 8,
    },
    sampleFamily: {
      fontSize: 7,
      letterSpacing: 1.5,
      color: accentColor,
      textTransform: "uppercase",
    },
    sampleText: {
      lineHeight: 1.25,
      color: "#111111",
    },
    footer: {
      position: "absolute",
      bottom: 32,
      left: 64,
      right: 64,
      flexDirection: "row",
      justifyContent: "space-between",
      fontSize: 8,
      color: "#aaaaaa",
      letterSpacing: 1.5,
      textTransform: "uppercase",
    },
    specimenHeader: {
      borderBottomWidth: 1,
      borderBottomColor: "#eeeeee",
      paddingBottom: 16,
      marginBottom: 28,
    },
    specimenEyebrow: {
      fontSize: 8,
      letterSpacing: 2,
      color: "#888888",
      textTransform: "uppercase",
      marginBottom: 6,
    },
    specimenName: {
      fontSize: 44,
      lineHeight: 1,
      color: "#111111",
    },
    charBlock: {
      marginBottom: 24,
    },
    charLabel: {
      fontSize: 7,
      letterSpacing: 1.5,
      color: "#888888",
      textTransform: "uppercase",
      marginBottom: 8,
    },
    charLine: {
      fontSize: 22,
      lineHeight: 1.2,
      color: "#111111",
    },
    sizeRow: {
      flexDirection: "row",
      alignItems: "baseline",
      marginBottom: 14,
      borderTopWidth: 1,
      borderTopColor: "#f3f3f3",
      paddingTop: 12,
    },
    sizeLabel: {
      width: 28,
      fontSize: 7,
      color: "#aaaaaa",
      letterSpacing: 1.5,
    },
    sizeText: {
      flex: 1,
      color: "#111111",
    },
  });

  const pairedSentences = ROLE_ORDER.filter((role) =>
    pairing.slots.some((s) => s.role === role),
  );

  const Doc = (
    <Document title={`${pairing.vibe || "Fontfun"} specimen`} author="Fontfun">
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.coverHeader}>
          <Text style={styles.coverEyebrow}>FONTFUN · SPECIMEN</Text>
          <Text style={styles.coverVibe}>{pairing.vibe || "Pairing"}</Text>
        </View>

        <Text
          style={[
            styles.coverTitle,
            {
              fontFamily: pairing.slots[0]
                ? resolveFamily(pairing.slots[0].family)
                : "Helvetica",
              fontWeight: 700,
            },
          ]}
        >
          {texts.heading}
        </Text>

        <View style={styles.coverDivider} />

        {pairedSentences.map((role) => {
          const slot = pairing.slots.find((s) => s.role === role);
          if (!slot) return null;
          return (
            <View key={role} style={styles.sampleBlock} wrap={false}>
              <View style={styles.sampleMeta}>
                <Text style={styles.sampleRole}>{ROLE_LABEL[role].toUpperCase()}</Text>
                <Text style={styles.sampleFamily}>· {slot.family}</Text>
              </View>
              <Text
                style={[
                  styles.sampleText,
                  {
                    fontFamily: resolveFamily(slot.family),
                    fontSize: ROLE_SAMPLE_SIZE[role],
                    fontWeight: role === "heading" ? 700 : 400,
                  },
                ]}
              >
                {texts[role]}
              </Text>
            </View>
          );
        })}

        <View style={styles.footer} fixed>
          <Text>FONTFUN.APP</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>

      {pairing.slots.map((slot) => {
        const ff = resolveFamily(slot.family);
        return (
        <Page key={`${slot.role}-${slot.family}`} size="A4" style={styles.page} wrap>
          <View style={styles.specimenHeader}>
            <Text style={styles.specimenEyebrow}>
              {ROLE_LABEL[slot.role].toUpperCase()}
            </Text>
            <Text
              style={[
                styles.specimenName,
                { fontFamily: ff, fontWeight: 700 },
              ]}
            >
              {slot.family}
            </Text>
          </View>

          <View style={styles.charBlock}>
            <Text style={styles.charLabel}>UPPERCASE</Text>
            <Text style={[styles.charLine, { fontFamily: ff }]}>
              ABCDEFGHIJKLMNOPQRSTUVWXYZ
            </Text>
          </View>
          <View style={styles.charBlock}>
            <Text style={styles.charLabel}>LOWERCASE</Text>
            <Text style={[styles.charLine, { fontFamily: ff }]}>
              abcdefghijklmnopqrstuvwxyz
            </Text>
          </View>
          <View style={styles.charBlock}>
            <Text style={styles.charLabel}>NUMERALS · PUNCTUATION</Text>
            <Text style={[styles.charLine, { fontFamily: ff }]}>
              0 1 2 3 4 5 6 7 8 9 . , : ; ! ? & @ #
            </Text>
          </View>

          {[64, 36, 22, 14].map((size) => (
            <View key={size} style={styles.sizeRow} wrap={false}>
              <Text style={styles.sizeLabel}>{size}</Text>
              <Text
                style={[
                  styles.sizeText,
                  { fontFamily: ff, fontSize: size, lineHeight: size >= 36 ? 1.05 : 1.3 },
                ]}
              >
                {size >= 36 ? "Type that travels well." : texts[slot.role]}
              </Text>
            </View>
          ))}

          <View style={styles.footer} fixed>
            <Text>{slot.family.toUpperCase()}</Text>
            <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
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
