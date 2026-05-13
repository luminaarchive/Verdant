import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal"],
});

export const metadata: Metadata = {
  title: "NaLI - Wildlife Field Intelligence",
  description:
    "A field intelligence platform for wildlife identification, ecological observation, conservation analysis, and structured field logging.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e3525" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className={`${plexMono.variable} ${inter.variable} bg-surface text-on-surface font-body-md text-body-md antialiased overflow-x-hidden selection:bg-primary selection:text-stone-50 flex flex-col min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
