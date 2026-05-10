import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fontfun - The super fast font generator!",
  description: "Press space to discover beautiful Google Font pairings.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Montserrat:wght@100..900&family=Karla:wght@200..800&family=Paytone+One&family=Orbitron:wght@400..900&family=Noto+Sans+Kayah+Li:wght@400..700&family=Jockey+One&family=Syncopate:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
