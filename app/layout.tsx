import type { Metadata } from "next";
import { buildAllFontsUrl } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fonty — Coolors for Fonts",
  description: "Press space to discover beautiful Google Font pairings.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={buildAllFontsUrl()} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
