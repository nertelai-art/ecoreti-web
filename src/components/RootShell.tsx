import { Barlow, Inter } from "next/font/google";
import type { ReactNode } from "react";
import { getDictionary } from "@/content";
import { htmlLang, type Locale } from "@/lib/i18n";
import { businessJsonLd } from "@/lib/seo";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { JsonLd } from "./JsonLd";
import { Reveal } from "./Reveal";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const barlow = Barlow({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-barlow", display: "swap" });

export function RootShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  const t = getDictionary(locale);
  return (
    <html lang={htmlLang[locale]} className={`${inter.variable} ${barlow.variable}`} suppressHydrationWarning>
      {/* eslint-disable-next-line @next/next/no-head-element -- regla del Pages Router; a l App Router el layout arrel pot tenir <head>. */}
      <head>
        {/* Marca que hi ha JS abans de pintar, perquè les animacions de revelat no facin pampallugues. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="antialiased">
        <JsonLd data={businessJsonLd(locale, t.home.meta.description)} />
        <Header locale={locale} t={t.nav} />
        <main id="contingut">{children}</main>
        <Footer locale={locale} t={t} />
        <Reveal />
      </body>
    </html>
  );
}
