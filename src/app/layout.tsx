import type { Metadata } from "next";
import { getServerLanguage } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://naliai.vercel.app"),
  title: "NaLI — Wildlife Field Intelligence for Indonesia",
  description:
    "Identify Indonesian wildlife species from photos, audio, and field notes. Field intelligence for rangers, researchers, and conservation teams.",
  openGraph: {
    title: "NaLI — Wildlife Field Intelligence for Indonesia",
    description:
      "Identify Indonesian wildlife species from photos, audio, and field notes. Field intelligence for rangers, researchers, and conservation teams.",
    url: "https://naliai.vercel.app",
    siteName: "NaLI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NaLI — Wildlife Field Intelligence for Indonesia",
    description:
      "Identify Indonesian wildlife species from photos, audio, and field notes. Field intelligence for rangers, researchers, and conservation teams.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const language = await getServerLanguage();

  return (
    <html lang={language}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#1e3525" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="bg-surface text-on-surface font-body-md text-body-md selection:bg-primary flex min-h-screen flex-col overflow-x-hidden antialiased selection:text-stone-50">
        <I18nProvider initialLanguage={language}>{children}</I18nProvider>
      </body>
    </html>
  );
}
