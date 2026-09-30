import { getDictionary } from "@/content";
import { faq } from "@/content/faq";
import { absoluteUrl, routes } from "@/lib/i18n";
import { site } from "@/lib/site";

export const dynamic = "force-static";

// Resum en text pla per als assistents d'IA (proposta llms.txt). Es genera dels mateixos textos del web.
export function GET() {
  const es = getDictionary("es");
  const lines = [
    `# ${site.name}`,
    "",
    `> ${es.home.meta.description}`,
    "",
    `${site.legalName} (NIF ${site.taxId}) es una empresa inscrita en el RERA (Registro de Empresas con Riesgo de Amianto) con sede en ${site.address.street}, ${site.address.postalCode} ${site.address.locality} (${site.address.region}). Trabaja en toda Cataluña.`,
    "",
    `- Teléfono: ${site.phoneDisplay}`,
    `- Correo: ${site.email}`,
    `- Horario: ${es.contact.hoursValue}`,
    "",
    "## Servicios",
    ...es.services.items.map((item) => `- [${item.title}](${absoluteUrl(routes.services.es)}#${item.id}): ${item.text}`),
    "",
    "## Páginas",
    `- [Inicio](${absoluteUrl(routes.home.es)}) · [Inici](${absoluteUrl(routes.home.ca)})`,
    `- [Servicios](${absoluteUrl(routes.services.es)}) · [Serveis](${absoluteUrl(routes.services.ca)})`,
    `- [Nosotros](${absoluteUrl(routes.about.es)}) · [Nosaltres](${absoluteUrl(routes.about.ca)})`,
    `- [Presupuesto](${absoluteUrl(routes.quote.es)}) · [Pressupost](${absoluteUrl(routes.quote.ca)})`,
    `- [Contacto](${absoluteUrl(routes.contact.es)}) · [Contacte](${absoluteUrl(routes.contact.ca)})`,
    "",
    "## Preguntas frecuentes",
    ...faq.es.flatMap((item) => [`### ${item.q}`, item.a, ""]),
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
