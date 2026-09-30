import { ButtonLink, Container } from "@/components/ui";
import { getDictionary } from "@/content";
import { routes, type Locale } from "@/lib/i18n";

export function NotFoundView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).notFound;
  return (
    <section className="bg-ink-950 pb-24 pt-40 text-white">
      <Container className="max-w-3xl text-center">
        <p className="font-display text-8xl font-semibold text-leaf-500">404</p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">{t.title}</h1>
        <p className="mt-4 text-lg text-ink-200">{t.text}</p>
        <div className="mt-10">
          <ButtonLink href={routes.home[locale]}>{t.back}</ButtonLink>
        </div>
      </Container>
    </section>
  );
}
