import { getDictionary } from "@/content";
import { leadSchema, type Lead, type LeadField } from "./schema";

export type Mail = { from: string; to: string; replyTo: string; subject: string; text: string; html: string };
export interface Mailer {
  send(mail: Mail): Promise<void>;
}

export type LeadResult =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "invalid"; fields: LeadField[] }
  | { status: "error" };

// Una persona no omple el formulari en menys de 3 segons; un bot, sí.
export const MIN_FILL_MS = 3000;

type Deps = { mailer: Mailer; from: string; to: string; now: number };

type MailEnv = Partial<Record<"RESEND_API_KEY" | "MAIL_FROM" | "MAIL_TO", string | undefined>> & Record<string, string | undefined>;

/**
 * Munta el client de correu a partir de l'entorn. Si falta configuració, retorna un client que
 * falla en enviar: així el formulari continua validant i l'usuari veu quins camps ha d'arreglar.
 */
export function mailerFromEnv(env: MailEnv, create: (apiKey: string) => Mailer): Omit<Deps, "now"> {
  const { RESEND_API_KEY: apiKey, MAIL_FROM: from, MAIL_TO: to } = env;
  if (!apiKey || !from || !to) {
    return {
      from: from ?? "",
      to: to ?? "",
      mailer: {
        async send() {
          throw new Error("falten RESEND_API_KEY, MAIL_FROM o MAIL_TO");
        },
      },
    };
  }
  return { mailer: create(apiKey), from, to };
}

export async function handleLead(input: Record<string, unknown>, deps: Deps): Promise<LeadResult> {
  const startedAt = typeof input.startedAt === "number" ? input.startedAt : 0;
  const isBot = Boolean(input.website) || !startedAt || deps.now - startedAt < MIN_FILL_MS;
  // Al bot li diem que ha anat bé: així no aprèn a esquivar la trampa.
  if (isBot) return { status: "ok" };

  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map((issue) => String(issue.path[0])))] as LeadField[];
    return { status: "invalid", fields };
  }

  try {
    await deps.mailer.send({ ...buildLeadEmail(parsed.data), from: deps.from, to: deps.to, replyTo: parsed.data.email });
    return { status: "ok" };
  } catch (error) {
    // Només el missatge: el mode dev de Next amb SWC en WASM peta formatant traces d'objectes Error.
    console.error("[lead] no s'ha pogut enviar el correu:", error instanceof Error ? error.message : String(error));
    return { status: "error" };
  }
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

/** El correu intern sempre va en castellà: és la bústia de l'empresa, no la del client. */
export function buildLeadEmail(lead: Lead) {
  const f = getDictionary("es").form;
  const rows: [string, string][] = [
    ["Nombre", lead.name],
    ["Email", lead.email],
    ["Teléfono", lead.phone],
  ];
  if (lead.kind === "quote") {
    rows.push(
      ["Inmueble", f.propertyTypes[lead.propertyType]],
      ["Municipio", lead.municipality],
      ["Superficie", lead.surface ? f.surfaces[lead.surface] : "—"],
      ["Servicio", f.services[lead.service]],
    );
  }
  rows.push(["Idioma de la web", lead.locale === "ca" ? "Català" : "Castellano"]);
  const message = lead.message?.trim() || "—";

  const subject =
    lead.kind === "quote"
      ? `Presupuesto: ${f.services[lead.service]} · ${lead.municipality} · ${lead.name}`
      : `Contacto web · ${lead.name}`;

  const text = [...rows.map(([k, v]) => `${k}: ${v}`), "", "Mensaje:", message].join("\n");
  const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;color:#1d2a33">
<h2 style="margin:0 0 16px;color:#465f70">${escapeHtml(subject)}</h2>
<table cellpadding="6" style="border-collapse:collapse">${rows
    .map(([k, v]) => `<tr><td style="color:#6b7c87">${k}</td><td><strong>${escapeHtml(v)}</strong></td></tr>`)
    .join("")}</table>
<p style="margin:20px 0 6px;color:#6b7c87">Mensaje</p>
<p style="white-space:pre-wrap;margin:0">${escapeHtml(message)}</p>
</div>`;
  return { subject, text, html };
}
