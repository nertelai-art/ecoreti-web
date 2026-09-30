"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Dictionary } from "@/content";
import { pageKeyFromPath, routes, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { Icon } from "./icons";

const navKeys = ["home", "about", "services", "contact"] as const;

export function Header({ locale, t }: { locale: Locale; t: Dictionary["nav"] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const current = pageKeyFromPath(pathname) ?? "home";
  const other: Locale = locale === "es" ? "ca" : "es";
  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solid ? "bg-white/90 shadow-[0_1px_0_rgb(0_0_0/0.06)] backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <a href="#contingut" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        {t.skip}
      </a>
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:h-20 lg:px-8">
        <Link href={routes.home[locale]} className="relative z-10 flex shrink-0 items-center" aria-label={`${site.name} — ${t.home}`}>
          <Image
            src="/images/logos/eco-reti.png"
            alt=""
            width={125}
            height={80}
            priority
            className={`h-11 w-auto transition-[filter] duration-500 lg:h-13 ${solid ? "" : "brightness-0 invert"}`}
          />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
          {navKeys.map((key) => {
            const active = current === key;
            return (
              <Link
                key={key}
                href={routes[key][locale]}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-[15px] font-medium transition-colors ${
                  solid ? "text-ink-700 hover:bg-ink-50 hover:text-ink-900" : "text-white/85 hover:bg-white/10 hover:text-white"
                } ${active ? (solid ? "text-ink-950" : "text-white") : ""}`}
              >
                {t[key]}
                {active && <span className="mx-auto mt-0.5 block h-0.5 w-4 rounded-full bg-leaf-500" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={routes[current][other]}
            hrefLang={other}
            lang={other}
            className={`hidden rounded-full px-3 py-2 text-sm font-semibold uppercase tracking-wider sm:block ${
              solid ? "text-ink-600 hover:bg-ink-50" : "text-white/80 hover:bg-white/10"
            }`}
            aria-label={`${t.language}: ${other === "ca" ? "Català" : "Castellano"}`}
          >
            {other}
          </Link>
          <Link
            href={routes.quote[locale]}
            className="hidden items-center gap-2 rounded-full bg-leaf-500 px-5 py-2.5 text-[15px] font-semibold text-ink-950 shadow-lg shadow-leaf-500/25 transition hover:-translate-y-0.5 hover:bg-leaf-400 sm:inline-flex"
          >
            {t.cta}
            <Icon name="arrowRight" className="size-4" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="menu-mobil"
            aria-label={open ? t.close : t.menu}
            className={`relative z-10 grid size-11 place-items-center rounded-full lg:hidden ${solid ? "text-ink-900 hover:bg-ink-50" : "text-white hover:bg-white/10"}`}
          >
            <Icon name={open ? "x" : "menu"} className="size-6" />
          </button>
        </div>
      </div>

      <div
        id="menu-mobil"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-18 overflow-y-auto bg-white px-4 pb-10 pt-6 sm:px-6 lg:hidden"
      >
        <nav aria-label="Principal" className="flex flex-col">
          {navKeys.map((key) => (
            <Link
              key={key}
              onClick={() => setOpen(false)}
              href={routes[key][locale]}
              aria-current={current === key ? "page" : undefined}
              className="flex items-center justify-between border-b border-ink-100 py-5 font-display text-3xl font-semibold text-ink-900"
            >
              {t[key]}
              <Icon name="arrowRight" className="size-6 text-leaf-600" />
            </Link>
          ))}
        </nav>
        <div className="mt-8 grid gap-3">
          <Link href={routes.quote[locale]} onClick={() => setOpen(false)} className="rounded-full bg-leaf-500 px-6 py-4 text-center text-lg font-semibold text-ink-950">
            {t.cta}
          </Link>
          <a href={`tel:${site.phone}`} className="flex items-center justify-center gap-2 rounded-full border border-ink-200 px-6 py-4 text-lg font-semibold text-ink-800">
            <Icon name="phone" className="size-5" /> {site.phoneDisplay}
          </a>
          <Link href={routes[current][other]} hrefLang={other} lang={other} className="py-3 text-center font-medium text-ink-600">
            {other === "ca" ? "Català" : "Castellano"}
          </Link>
        </div>
      </div>
    </header>
  );
}
