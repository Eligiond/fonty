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

function bunnySlug(family: string): string {
  return family
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function bunnyUrl(family: string, weight: 400 | 700, style: "normal" | "italic" = "normal"): string {
  const slug = bunnySlug(family);
  return `https://fonts.bunny.net/${slug}/files/${slug}-latin-${weight}-${style}.ttf`;
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

  for (const family of uniqueFamilies) {
    try {
      Font.register({
        family,
        fonts: [
          { src: bunnyUrl(family, 400), fontWeight: 400 },
          { src: bunnyUrl(family, 700), fontWeight: 700 },
        ],
      });
    } catch {
      // Font registration is best-effort; @react-pdf will fall back to default
    }
    Font.registerHyphenationCallback((word) => [word]);
  }

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
            { fontFamily: pairing.slots[0]?.family ?? "Helvetica", fontWeight: 700 },
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
                    fontFamily: slot.family,
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

      {pairing.slots.map((slot) => (
        <Page key={`${slot.role}-${slot.family}`} size="A4" style={styles.page} wrap>
          <View style={styles.specimenHeader}>
            <Text style={styles.specimenEyebrow}>
              {ROLE_LABEL[slot.role].toUpperCase()}
            </Text>
            <Text
              style={[
                styles.specimenName,
                { fontFamily: slot.family, fontWeight: 700 },
              ]}
            >
              {slot.family}
            </Text>
          </View>

          <View style={styles.charBlock}>
            <Text style={styles.charLabel}>UPPERCASE</Text>
            <Text style={[styles.charLine, { fontFamily: slot.family }]}>
              ABCDEFGHIJKLMNOPQRSTUVWXYZ
            </Text>
          </View>
          <View style={styles.charBlock}>
            <Text style={styles.charLabel}>LOWERCASE</Text>
            <Text style={[styles.charLine, { fontFamily: slot.family }]}>
              abcdefghijklmnopqrstuvwxyz
            </Text>
          </View>
          <View style={styles.charBlock}>
            <Text style={styles.charLabel}>NUMERALS · PUNCTUATION</Text>
            <Text style={[styles.charLine, { fontFamily: slot.family }]}>
              0 1 2 3 4 5 6 7 8 9 . , : ; ! ? & @ #
            </Text>
          </View>

          {[64, 36, 22, 14].map((size) => (
            <View key={size} style={styles.sizeRow} wrap={false}>
              <Text style={styles.sizeLabel}>{size}</Text>
              <Text
                style={[
                  styles.sizeText,
                  { fontFamily: slot.family, fontSize: size, lineHeight: size >= 36 ? 1.05 : 1.3 },
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
      ))}
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
