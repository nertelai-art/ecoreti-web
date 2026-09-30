import type { Metadata } from "next";
import type { FaqItem } from "@/content/faq";
import { absoluteUrl, alternatesFor, ogLocale, routes, type Locale, type PageKey } from "./i18n";
import { site } from "./site";

const OG_IMAGE = { url: "/images/og.jpg", width: 1200, height: 630, alt: "Eco-Reti 2030" };

export function pageMetadata(key: PageKey, locale: Locale, meta: { title: string; description: string }): Metadata {
  return {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: alternatesFor(key, locale),
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: ogLocale[locale],
      alternateLocale: [ogLocale[locale === "es" ? "ca" : "es"]],
      url: absoluteUrl(routes[key][locale]),
      title: meta.title,
      description: meta.description,
      images: [OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title: meta.title, description: meta.description, images: [OG_IMAGE.url] },
  };
}

const businessId = `${site.url}/#empresa`;

/** Empresa local: el bloc que més pesa per a cerques locals i per als assistents d'IA. */
export function businessJsonLd(locale: Locale, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    "@id": businessId,
    name: site.name,
    legalName: site.legalName,
    taxID: site.taxId,
    description,
    url: absoluteUrl(routes.home[locale]),
    logo: absoluteUrl("/images/logos/eco-reti.png"),
    image: absoluteUrl("/images/og.jpg"),
    telephone: site.phone,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      postalCode: site.address.postalCode,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    areaServed: [
      { "@type": "AdministrativeArea", name: "Catalunya" },
      ...site.areaServed.map((name) => ({ "@type": "AdministrativeArea", name })),
    ],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: site.hours.days,
      opens: site.hours.opens,
      closes: site.hours.closes,
    },
    knowsAbout: ["Retirada de amianto", "Fibrocemento", "Uralita", "Renovación de cubiertas", "Panel sándwich", "Gestión de residuos peligrosos", "Eficiencia energética"],
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      name: "Inscripción en el Registro de Empresas con Riesgo de Amianto (RERA)",
      credentialCategory: "Registro oficial",
    },
    inLanguage: locale === "ca" ? "ca" : "es",
  };
}

export function servicesJsonLd(items: { id: string; title: string; text: string }[], locale: Locale) {
  return items.map((item) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${absoluteUrl(routes.services[locale])}#${item.id}`,
    name: item.title,
    description: item.text,
    serviceType: item.title,
    provider: { "@id": businessId },
    areaServed: { "@type": "AdministrativeArea", name: "Catalunya" },
    url: `${absoluteUrl(routes.services[locale])}#${item.id}`,
  }));
}

export function faqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function breadcrumbJsonLd(crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}
