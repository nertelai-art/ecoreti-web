import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/content";
import { routes, type Locale, type PageKey } from "@/lib/i18n";
import { breadcrumbJsonLd } from "@/lib/seo";
import { Icon } from "../icons";
import { JsonLd } from "../JsonLd";
import { Container, Wave } from "../ui";

export function PageHero({ locale, page, title, lead, image = "/images/coberta-renovada-nau.jpg" }: { locale: Locale; page: PageKey; title: string; lead?: string; image?: string | null }) {
  const t = getDictionary(locale);
  const crumbs = [
    { name: t.breadcrumbHome, path: routes.home[locale] },
    { name: title, path: routes[page][locale] },
  ];
  return (
    <section className="relative isolate overflow-hidden bg-ink-950 pb-16 pt-36 sm:pb-24 sm:pt-44">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      {image && (
        <>
          <Image src={image} alt="" fill priority sizes="100vw" className="-z-20 object-cover opacity-40" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/40" />
        </>
      )}
      <Container>
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-ink-300">
            <li>
              <Link href={crumbs[0]!.path} className="hover:text-white">{crumbs[0]!.name}</Link>
            </li>
            <li aria-hidden="true"><Icon name="arrowRight" className="size-3.5" /></li>
            <li aria-current="page" className="text-white">{title}</li>
          </ol>
        </nav>
        <h1 className="mt-6 max-w-4xl animate-rise text-5xl font-semibold leading-[1.02] text-white sm:text-7xl">{title}</h1>
        <div className="mt-4 h-3 w-40 overflow-hidden text-leaf-500">
          <Wave className="h-full w-[200%] motion-safe:animate-wave" />
        </div>
        {lead && <p className="mt-6 max-w-3xl animate-rise text-lg leading-relaxed text-ink-100 [animation-delay:150ms] sm:text-xl">{lead}</p>}
      </Container>
    </section>
  );
}
