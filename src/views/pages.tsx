import Image from "next/image";
import { Icon, type IconName } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { LeadForm } from "@/components/LeadForm";
import { CtaBand, Process, Testimonials } from "@/components/sections/HomeSections";
import { PageHero } from "@/components/sections/PageHero";
import { Stats } from "@/components/sections/Stats";
import { Container, Eyebrow, SectionHeading } from "@/components/ui";
import { getDictionary } from "@/content";
import type { Locale } from "@/lib/i18n";
import { pageMetadata, servicesJsonLd } from "@/lib/seo";
import { site, whatsappUrl } from "@/lib/site";

export const aboutMetadata = (locale: Locale) => pageMetadata("about", locale, getDictionary(locale).about.meta);
export const servicesMetadata = (locale: Locale) => pageMetadata("services", locale, getDictionary(locale).services.meta);
export const contactMetadata = (locale: Locale) => pageMetadata("contact", locale, getDictionary(locale).contact.meta);
export const quoteMetadata = (locale: Locale) => pageMetadata("quote", locale, getDictionary(locale).quote.meta);

const teamIcons: IconName[] = ["clipboard", "hardHat", "shield", "users"];

export function AboutPage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const a = t.about;
  return (
    <>
      <PageHero locale={locale} page="about" title={a.title} lead={a.lead} image="/images/treballs-seguretat-xarxes-coberta.jpg" />
      <section className="py-24 sm:py-32">
        <Container className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow={a.teamTitle} title={a.teamText} />
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
            {a.team.map((item, index) => (
              <li key={item.title} data-reveal style={{ ["--reveal-delay" as string]: `${index * 80}ms` }} className="rounded-3xl bg-mist p-7">
                <Icon name={teamIcons[index] ?? "check"} className="size-8 text-leaf-600" />
                <h3 className="mt-5 text-2xl font-semibold text-ink-900">{item.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-600">{item.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-ink-950 py-24 text-white sm:py-32">
        <Container>
          <SectionHeading eyebrow={a.trustTitle} title={a.trustText} tone="light" />
          <div className="mt-14">
            <Stats stats={t.home.stats} locale={locale} />
          </div>
        </Container>
      </section>

      <section className="py-24 sm:py-32">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <div data-reveal className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image src="/images/residus-amiant-encapsulats.jpg" alt={t.services.items[2]!.imageAlt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div data-reveal>
            <div className="inline-flex rounded-2xl bg-white p-3 ring-1 ring-ink-100">
              <Image src="/images/logos/rera.png" alt="RERA" width={145} height={79} className="h-14 w-auto" />
            </div>
            <h2 className="mt-6 text-4xl font-semibold text-ink-900 sm:text-5xl">{a.reraTitle}</h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-600">{a.reraText}</p>
          </div>
        </Container>
      </section>

      <Testimonials t={t.home.testimonials} />
      <div className="pt-24 sm:pt-32">
        <CtaBand locale={locale} t={t.home.cta} />
      </div>
    </>
  );
}

export function ServicesPage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const s = t.services;
  return (
    <>
      <JsonLd data={servicesJsonLd(s.items, locale)} />
      <PageHero locale={locale} page="services" title={s.title} lead={s.lead} image="/images/retirada-amiant-coberta-plaques-solars.jpg" />
      <nav aria-label={s.title} className="sticky top-18 z-30 border-b border-ink-100 bg-white/90 backdrop-blur-xl lg:top-20">
        <Container className="flex gap-2 overflow-x-auto py-3">
          {s.items.map((item) => (
            <a key={item.id} href={`#${item.id}`} className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-mist">
              {item.title}
            </a>
          ))}
        </Container>
      </nav>
      <div className="py-12 sm:py-20">
        {s.items.map((item, index) => (
          <section key={item.id} id={item.id} aria-labelledby={`${item.id}-titol`} className="scroll-mt-40 py-12 sm:py-16">
            <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
              <div data-reveal className={`relative aspect-[4/3] overflow-hidden rounded-3xl ${index % 2 ? "lg:order-2" : ""}`}>
                <Image src={item.image} alt={item.imageAlt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
                <span className="absolute left-5 top-5 rounded-full bg-white/90 px-4 py-1.5 font-display text-lg font-semibold text-ink-900 backdrop-blur">0{index + 1}</span>
              </div>
              <div data-reveal>
                <h2 id={`${item.id}-titol`} className="text-4xl font-semibold text-ink-900 sm:text-5xl">{item.title}</h2>
                <p className="mt-5 text-lg leading-relaxed text-ink-600">{item.text}</p>
                <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                  {item.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 font-medium text-ink-800">
                      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-leaf-500 text-ink-950">
                        <Icon name="check" className="size-3.5" strokeWidth={3} />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </Container>
          </section>
        ))}
      </div>
      <Process t={t.home.process} />
      <section className="py-24 sm:py-32">
        <Container className="max-w-4xl text-center">
          <div data-reveal>
            <Eyebrow>{s.where.title}</Eyebrow>
            <p className="mt-6 font-display text-3xl font-medium leading-snug text-ink-800 sm:text-4xl">{s.where.text}</p>
          </div>
        </Container>
      </section>
      <CtaBand locale={locale} t={t.home.cta} />
    </>
  );
}

function ContactCard({ icon, label, children }: { icon: IconName; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-leaf-500 text-ink-950">
        <Icon name={icon} className="size-6" />
      </span>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-ink-300">{label}</p>
        <div className="mt-1 text-lg text-white">{children}</div>
      </div>
    </div>
  );
}

function ContactAside({ locale }: { locale: Locale }) {
  const c = getDictionary(locale).contact;
  return (
    <aside className="rounded-3xl bg-ink-900 p-8 sm:p-10">
      <h2 className="text-2xl font-semibold text-white">{c.infoTitle}</h2>
      <div className="mt-8 grid gap-7">
        <ContactCard icon="phone" label={c.phone}>
          <a href={`tel:${site.phone}`} className="hover:text-leaf-400">{site.phoneDisplay}</a>
        </ContactCard>
        <ContactCard icon="mail" label={c.email}>
          <a href={`mailto:${site.email}`} className="break-all hover:text-leaf-400">{site.email}</a>
        </ContactCard>
        <ContactCard icon="clock" label={c.hours}>{c.hoursValue}</ContactCard>
        <ContactCard icon="mapPin" label={c.address}>
          {site.address.street}, {site.address.postalCode} {site.address.locality}
        </ContactCard>
        <ContactCard icon="globe" label={c.area}>{c.areaValue}</ContactCard>
      </div>
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10">
        <Icon name="message" className="size-5" /> {c.whatsapp}
      </a>
    </aside>
  );
}

export function ContactPage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <>
      <PageHero locale={locale} page="contact" title={t.contact.title} lead={t.contact.lead} image="/images/coberta-nova-panell-sandvitx.jpg" />
      <section className="py-20 sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <LeadForm kind="contact" locale={locale} t={t.form} />
          </div>
          <div className="lg:col-span-5">
            <ContactAside locale={locale} />
          </div>
        </Container>
      </section>
    </>
  );
}

export function QuotePage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <>
      <PageHero locale={locale} page="quote" title={t.quote.title} lead={t.quote.lead} image="/images/gestio-residus-amiant-obra.jpg" />
      <section className="py-20 sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <LeadForm kind="quote" locale={locale} t={t.form} />
          </div>
          <div className="space-y-6 lg:col-span-5">
            <ol className="grid gap-4 rounded-3xl bg-mist p-8">
              {t.quote.steps.map((step, index) => (
                <li key={step} className="flex items-center gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ink-900 font-display text-lg font-semibold text-white">{index + 1}</span>
                  <span className="text-lg font-medium text-ink-800">{step}</span>
                </li>
              ))}
            </ol>
            <ContactAside locale={locale} />
          </div>
        </Container>
      </section>
    </>
  );
}
