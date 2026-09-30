import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/content";
import { routes, type Locale } from "@/lib/i18n";
import { site, whatsappUrl } from "@/lib/site";
import { Icon } from "./icons";

export function Footer({ locale, t }: { locale: Locale; t: Dictionary }) {
  const year = 2026;
  return (
    <footer className="bg-ink-950 text-ink-200">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-12 lg:px-8 lg:py-20">
        <div className="lg:col-span-5">
          <Image src="/images/logos/eco-reti.png" alt={site.name} width={125} height={80} className="h-14 w-auto brightness-0 invert" />
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ink-300">{t.footer.about}</p>
          <div className="mt-6 inline-flex items-center gap-3 rounded-xl bg-white px-3 py-2">
            <Image src="/images/logos/rera.png" alt="RERA — Registro de Empresas con Riesgo de Amianto" width={145} height={79} className="h-10 w-auto" />
          </div>
        </div>

        <nav aria-label={t.footer.links} className="lg:col-span-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-leaf-400">{t.footer.links}</h2>
          <ul className="mt-5 space-y-3">
            {(["home", "about", "services", "contact", "quote"] as const).map((key) => (
              <li key={key}>
                <Link href={routes[key][locale]} className="transition hover:text-white">
                  {t.nav[key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-leaf-400">{t.footer.contact}</h2>
          <address className="mt-5 space-y-4 not-italic">
            <p className="flex gap-3">
              <Icon name="mapPin" className="mt-0.5 size-5 shrink-0 text-leaf-500" />
              <span>
                {site.address.street}
                <br />
                {site.address.postalCode} {site.address.locality} ({site.address.region})
              </span>
            </p>
            <a href={`tel:${site.phone}`} className="flex gap-3 transition hover:text-white">
              <Icon name="phone" className="size-5 shrink-0 text-leaf-500" /> {site.phoneDisplay}
            </a>
            <a href={`mailto:${site.email}`} className="flex gap-3 transition hover:text-white">
              <Icon name="mail" className="size-5 shrink-0 text-leaf-500" /> {site.email}
            </a>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex gap-3 transition hover:text-white">
              <Icon name="message" className="size-5 shrink-0 text-leaf-500" /> WhatsApp
            </a>
          </address>
        </div>
      </div>

      <div className="border-t border-white/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:justify-between lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <Image src="/images/logos/financiado-ue-nextgeneration.png" alt="Financiado por la Unión Europea — NextGenerationEU" width={144} height={36} className="h-9 w-auto" />
            <Image src="/images/logos/prtr.png" alt="Plan de Recuperación, Transformación y Resiliencia" width={176} height={36} className="h-9 w-auto" />
            <Image src="/images/logos/kit-digital.png" alt="Kit Digital" width={130} height={36} className="h-9 w-auto" />
          </div>
          <p className="max-w-md text-center text-xs leading-relaxed text-ink-500 lg:text-right">{t.footer.funding}</p>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-ink-300 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>
          © {year} {site.legalName}. {t.footer.rights}
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          <li><Link href={routes.legal[locale]} className="hover:text-white">{t.footer.legal}</Link></li>
          <li><Link href={routes.privacy[locale]} className="hover:text-white">{t.footer.privacy}</Link></li>
          <li><Link href={routes.cookies[locale]} className="hover:text-white">{t.footer.cookies}</Link></li>
        </ul>
      </div>
    </footer>
  );
}
