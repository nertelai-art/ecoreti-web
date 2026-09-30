import { site } from "./site";

export const locales = ["es", "ca"] as const;
export type Locale = (typeof locales)[number];

// Les rutes són les mateixes que tenia el WordPress: canviar-les faria perdre posicionament.
export const routes = {
  home: { es: "/", ca: "/ca/" },
  about: { es: "/nosotros/", ca: "/ca/nosaltres/" },
  services: { es: "/servicios/", ca: "/ca/serveis/" },
  contact: { es: "/contacto/", ca: "/ca/contacte/" },
  quote: { es: "/presupuesto/", ca: "/ca/pressupost/" },
  legal: { es: "/aviso-legal/", ca: "/ca/avis-legal/" },
  privacy: { es: "/politica-privacidad/", ca: "/ca/politica-privacitat/" },
  cookies: { es: "/politica-cookies/", ca: "/ca/politica-cookies/" },
} as const satisfies Record<string, Record<Locale, string>>;

export type PageKey = keyof typeof routes;

export const htmlLang: Record<Locale, string> = { es: "es-ES", ca: "ca-ES" };
export const ogLocale: Record<Locale, string> = { es: "es_ES", ca: "ca_ES" };

export function pageKeyFromPath(pathname: string): PageKey | undefined {
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return (Object.keys(routes) as PageKey[]).find(
    (key) => routes[key].es === normalized || routes[key].ca === normalized,
  );
}

export function absoluteUrl(path: string) {
  return `${site.url}${path}`;
}

/** Canonical i hreflang d'una pàgina, en el format que espera `metadata.alternates`. */
export function alternatesFor(key: PageKey, locale: Locale) {
  return {
    canonical: absoluteUrl(routes[key][locale]),
    languages: {
      "es-ES": absoluteUrl(routes[key].es),
      "ca-ES": absoluteUrl(routes[key].ca),
      "x-default": absoluteUrl(routes[key].es),
    },
  };
}
