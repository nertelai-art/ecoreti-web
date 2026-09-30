import Image from "next/image";
import type { Dictionary } from "@/content";
import { routes, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { Icon } from "../icons";
import { ButtonLink, Container, Wave } from "../ui";

export function Hero({ locale, t }: { locale: Locale; t: Dictionary["home"]["hero"] }) {
  return (
    <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-ink-950 pb-16 pt-32 sm:pb-24">
      <Image
        src="/images/retirada-amiant-coberta-plaques-solars.jpg"
        alt={t.imageAlt}
        fill
        priority
        sizes="100vw"
        className="-z-20 scale-105 object-cover object-center motion-safe:animate-[heroZoom_18s_ease-out_both]"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950 via-ink-950/75 to-ink-950/30" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-950/80 via-ink-950/20 to-transparent" />

      <Container className="w-full">
        <div className="max-w-4xl">
          <p className="inline-flex animate-rise items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur">
            <Icon name="shield" className="size-4 text-leaf-400" />
            {t.eyebrow}
          </p>
          <h1 className="mt-6 animate-rise text-5xl font-semibold leading-[0.98] text-white [animation-delay:120ms] sm:text-7xl lg:text-8xl">
            {t.title}
            <span className="relative block text-leaf-400">
              {t.titleAccent}
            </span>
          </h1>
          <div className="mt-2 h-4 w-48 animate-rise overflow-hidden text-leaf-500 [animation-delay:200ms] sm:w-64">
            <Wave className="h-full w-[200%] motion-safe:animate-wave" />
          </div>
          <p className="mt-6 max-w-2xl animate-rise text-lg leading-relaxed text-ink-100 [animation-delay:260ms] sm:text-xl">{t.lead}</p>
          <div className="mt-10 flex animate-rise flex-col gap-3 [animation-delay:380ms] sm:flex-row">
            <ButtonLink href={routes.quote[locale]}>{t.ctaPrimary}</ButtonLink>
            <a
              href={`tel:${site.phone}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-7 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              <Icon name="phone" className="size-5" />
              {site.phoneDisplay}
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
