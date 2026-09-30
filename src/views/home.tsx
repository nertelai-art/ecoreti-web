import { BottleShowcase } from "@/components/bottle/BottleShowcase";
import { JsonLd } from "@/components/JsonLd";
import { Hero } from "@/components/sections/Hero";
import { CtaBand, Faq, Intro, Process, ServicesGrid, Testimonials, Why } from "@/components/sections/HomeSections";
import { Stats } from "@/components/sections/Stats";
import { Container } from "@/components/ui";
import { getDictionary } from "@/content";
import { faq } from "@/content/faq";
import type { Locale } from "@/lib/i18n";
import { faqJsonLd, pageMetadata } from "@/lib/seo";

export const homeMetadata = (locale: Locale) => pageMetadata("home", locale, getDictionary(locale).home.meta);

export function HomePage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <>
      <JsonLd data={faqJsonLd(faq[locale])} />
      <Hero locale={locale} t={t.home.hero} />
      <div className="bg-ink-950 pb-16 sm:pb-24">
        <Container>
          <Stats stats={t.home.stats} locale={locale} />
        </Container>
      </div>
      <Intro locale={locale} t={t.home.intro} />
      <ServicesGrid locale={locale} t={t.home.services} items={t.services.items} />
      <Process t={t.home.process} />
      <BottleShowcase t={t.bottle} />
      <Why t={t.home.why} sectors={t.home.sectors} />
      <Testimonials t={t.home.testimonials} />
      <Faq t={t.home.faq} items={faq[locale]} />
      <CtaBand locale={locale} t={t.home.cta} />
    </>
  );
}
