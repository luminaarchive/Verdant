import type { Metadata } from "next";
import "./globals.css";

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
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#1e3525" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className="bg-surface text-on-surface font-body-md text-body-md antialiased overflow-x-hidden selection:bg-primary selection:text-stone-50 flex flex-col min-h-screen"
      >
        {children}
      </body>
    </html>
  );
}
