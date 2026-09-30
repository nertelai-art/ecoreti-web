import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/content";
import type { FaqItem } from "@/content/faq";
import { routes, type Locale } from "@/lib/i18n";
import { Icon, type IconName } from "../icons";
import { ButtonLink, Container, Eyebrow, SectionHeading } from "../ui";

const serviceIcons: IconName[] = ["shield", "home", "clipboard", "zap"];

export function Intro({ locale, t }: { locale: Locale; t: Dictionary["home"]["intro"] }) {
  return (
    <section className="py-24 sm:py-32">
      <Container className="grid items-center gap-14 lg:grid-cols-2">
        <div data-reveal>
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-4xl font-semibold leading-[1.05] text-ink-900 sm:text-5xl">{t.title}</h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-600">{t.text}</p>
          <div className="mt-8">
            <ButtonLink href={routes.about[locale]} variant="dark">{t.cta}</ButtonLink>
          </div>
        </div>
        <div className="relative grid grid-cols-5 gap-4" data-reveal style={{ ["--reveal-delay" as string]: "150ms" }}>
          <div className="relative col-span-3 aspect-[3/4] overflow-hidden rounded-3xl">
            <Image src="/images/treballs-seguretat-xarxes-coberta.jpg" alt="" fill sizes="(min-width: 1024px) 30vw, 60vw" className="object-cover" />
          </div>
          <div className="col-span-2 flex flex-col gap-4 pt-16">
            <div className="relative aspect-square overflow-hidden rounded-3xl">
              <Image src="/images/gestio-residus-amiant-obra.jpg" alt="" fill sizes="(min-width: 1024px) 20vw, 40vw" className="object-cover" />
            </div>
            <div className="rounded-3xl bg-leaf-500 p-5 text-ink-950">
              <Icon name="shield" className="size-8" />
              <p className="mt-3 font-display text-xl font-semibold leading-tight">RERA</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function ServicesGrid({ locale, t, items }: { locale: Locale; t: Dictionary["home"]["services"]; items: Dictionary["services"]["items"] }) {
  return (
    <section className="bg-mist py-24 sm:py-32">
      <Container>
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading eyebrow={t.eyebrow} title={t.title} />
          <div data-reveal>
            <ButtonLink href={routes.services[locale]} variant="dark">{t.cta}</ButtonLink>
          </div>
        </div>
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <li key={item.id} data-reveal style={{ ["--reveal-delay" as string]: `${index * 90}ms` }}>
              <Link
                href={`${routes.services[locale]}#${item.id}`}
                className="group relative flex h-full min-h-[26rem] flex-col justify-end overflow-hidden rounded-3xl bg-ink-900 p-7 text-white"
              >
                <Image src={item.image} alt={item.imageAlt} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover opacity-60 transition duration-700 group-hover:scale-105 group-hover:opacity-45" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-transparent" />
                <div className="relative">
                  <span className="grid size-12 place-items-center rounded-2xl bg-leaf-500 text-ink-950">
                    <Icon name={serviceIcons[index] ?? "check"} className="size-6" />
                  </span>
                  <h3 className="mt-5 text-2xl font-semibold">{item.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-100">{item.short}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-leaf-400">
                    <Icon name="arrowRight" className="size-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export function Process({ t }: { t: Dictionary["home"]["process"] }) {
  return (
    <section className="relative overflow-hidden bg-ink-950 py-24 text-white sm:py-32">
      <div className="pointer-events-none absolute -right-40 -top-40 size-[36rem] rounded-full bg-leaf-500/10 blur-3xl" aria-hidden="true" />
      <Container className="relative">
        <SectionHeading eyebrow={t.eyebrow} title={t.title} tone="light" />
        <ol className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {t.steps.map((step, index) => (
            <li key={step.title} data-reveal style={{ ["--reveal-delay" as string]: `${index * 110}ms` }} className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-7">
              <span className="font-display text-6xl font-semibold text-leaf-500/90">0{index + 1}</span>
              <h3 className="mt-6 text-2xl font-semibold">{step.title}</h3>
              <p className="mt-3 leading-relaxed text-ink-200">{step.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

const whyIcons: IconName[] = ["hardHat", "shield", "clipboard", "users"];

export function Why({ t, sectors }: { t: Dictionary["home"]["why"]; sectors: Dictionary["home"]["sectors"] }) {
  const sectorIcons: IconName[] = ["home", "building", "factory", "wheat", "store"];
  return (
    <section className="py-24 sm:py-32">
      <Container className="grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading eyebrow={t.eyebrow} title={t.title} />
          <div data-reveal className="relative mt-10 aspect-[4/3] overflow-hidden rounded-3xl">
            <Image src="/images/coberta-renovada-nau.jpg" alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          </div>
        </div>
        <div className="lg:col-span-7">
          <ul className="grid gap-5 sm:grid-cols-2">
            {t.items.map((item, index) => (
              <li key={item.title} data-reveal style={{ ["--reveal-delay" as string]: `${index * 80}ms` }} className="rounded-3xl bg-mist p-7">
                <Icon name={whyIcons[index] ?? "check"} className="size-8 text-leaf-600" />
                <h3 className="mt-5 text-2xl font-semibold text-ink-900">{item.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-600">{item.text}</p>
              </li>
            ))}
          </ul>
          <div data-reveal className="mt-12">
            <Eyebrow>{sectors.eyebrow}</Eyebrow>
            <h3 className="mt-3 text-3xl font-semibold text-ink-900">{sectors.title}</h3>
            <ul className="mt-6 flex flex-wrap gap-3">
              {sectors.items.map((sector, index) => (
                <li key={sector} className="inline-flex items-center gap-2 rounded-full border border-ink-200 px-4 py-2.5 font-medium text-ink-800">
                  <Icon name={sectorIcons[index] ?? "check"} className="size-5 text-leaf-600" />
                  {sector}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function Testimonials({ t }: { t: Dictionary["home"]["testimonials"] }) {
  return (
    <section className="bg-mist py-24 sm:py-32">
      <Container>
        <SectionHeading eyebrow={t.eyebrow} title={t.title} align="center" />
        <ul className="mt-14 grid gap-5 md:grid-cols-2">
          {t.items.map((item, index) => (
            <li key={item.author} data-reveal style={{ ["--reveal-delay" as string]: `${(index % 2) * 100}ms` }}>
              <figure className="flex h-full flex-col rounded-3xl bg-white p-8 shadow-[0_1px_2px_rgb(0_0_0/0.04)]">
                <div className="flex gap-1 text-leaf-500" aria-hidden="true">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Icon key={i} name="star" className="size-5 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-5 flex-1 text-xl leading-relaxed text-ink-800">“{item.quote}”</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-full bg-ink-600 font-display text-lg font-semibold text-white">{item.author.charAt(0)}</span>
                  <span>
                    <span className="block font-semibold text-ink-900">{item.author}</span>
                    <span className="text-sm text-ink-500">{item.city}</span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export function Faq({ t, items }: { t: { eyebrow: string; title: string }; items: FaqItem[] }) {
  return (
    <section className="py-24 sm:py-32">
      <Container className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <SectionHeading eyebrow={t.eyebrow} title={t.title} />
          </div>
        </div>
        <div className="divide-y divide-ink-100 border-y border-ink-100 lg:col-span-8">
          {items.map((item) => (
            <details key={item.q} className="group py-2" data-reveal>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-xl font-semibold text-ink-900 [&::-webkit-details-marker]:hidden">
                <h3>{item.q}</h3>
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-mist text-ink-700 transition group-open:rotate-45 group-open:bg-leaf-500 group-open:text-ink-950">
                  <Icon name="plus" className="size-5" />
                </span>
              </summary>
              <p className="max-w-3xl pb-6 text-lg leading-relaxed text-ink-600">{item.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function CtaBand({ locale, t }: { locale: Locale; t: Dictionary["home"]["cta"] }) {
  return (
    <section className="px-4 pb-24 sm:px-6 sm:pb-32 lg:px-8">
      <div data-reveal className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-ink-900 px-6 py-16 text-center sm:px-16 sm:py-24">
        <Image src="/images/coberta-nova-panell-sandvitx.jpg" alt="" fill sizes="100vw" className="-z-10 object-cover opacity-25" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-ink-900/60 via-ink-900/80 to-leaf-700/40" />
        <h2 className="mx-auto max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-6xl">{t.title}</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-100">{t.text}</p>
        <div className="mt-10">
          <ButtonLink href={routes.quote[locale]}>{t.button}</ButtonLink>
        </div>
      </div>
    </section>
  );
}
