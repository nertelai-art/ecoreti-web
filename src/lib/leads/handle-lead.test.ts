import { describe, expect, it } from "vitest";
import { buildLeadEmail, handleLead, mailerFromEnv, MIN_FILL_MS, type Mail, type Mailer } from "./handle-lead";

const NOW = 1_800_000_000_000;

function fakeMailer(fail = false) {
  const sent: Mail[] = [];
  const mailer: Mailer = {
    async send(mail) {
      if (fail) throw new Error("down");
      sent.push(mail);
    },
  };
  return { mailer, sent };
}

const deps = (mailer: Mailer) => ({ mailer, from: "web@ecoreti2030.com", to: "info@ecoreti2030.com", now: NOW });

const quote = {
  kind: "quote",
  locale: "ca",
  name: "Anna Puig",
  email: "anna@example.com",
  phone: "+34 600 11 22 33",
  propertyType: "industrial",
  municipality: "Salt",
  surface: "200-1000",
  service: "both",
  message: "Nau de 1970",
  privacy: true,
  startedAt: NOW - 20_000,
};

describe("handleLead", () => {
  it("envia la sol·licitud de pressupost a la bústia de l'empresa amb reply-to del client", async () => {
    const { mailer, sent } = fakeMailer();
    expect(await handleLead(quote, deps(mailer))).toEqual({ status: "ok" });
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({ to: "info@ecoreti2030.com", replyTo: "anna@example.com" });
    expect(sent[0]!.subject).toContain("Salt");
  });

  it("retorna els camps invàlids sense enviar res", async () => {
    const { mailer, sent } = fakeMailer();
    const result = await handleLead({ ...quote, email: "no-es-un-correu", phone: "12", privacy: false }, deps(mailer));
    expect(result.status).toBe("invalid");
    if (result.status === "invalid") expect(result.fields.sort()).toEqual(["email", "phone", "privacy"]);
    expect(sent).toHaveLength(0);
  });

  it("exigeix missatge al formulari de contacte", async () => {
    const { mailer } = fakeMailer();
    const contact = { kind: "contact", locale: "es", name: "Pau", email: "pau@example.com", phone: "621041628", privacy: true, startedAt: NOW - 10_000 };
    const result = await handleLead(contact, deps(mailer));
    expect(result).toEqual({ status: "invalid", fields: ["message"] });
  });

  it("descarta en silenci els bots: camp trampa omplert o formulari massa ràpid", async () => {
    const { mailer, sent } = fakeMailer();
    expect(await handleLead({ ...quote, website: "http://spam" }, deps(mailer))).toEqual({ status: "ok" });
    expect(await handleLead({ ...quote, startedAt: NOW - MIN_FILL_MS + 1 }, deps(mailer))).toEqual({ status: "ok" });
    expect(sent).toHaveLength(0);
  });

  it("informa d'error si el proveïdor de correu falla", async () => {
    const { mailer } = fakeMailer(true);
    expect(await handleLead(quote, deps(mailer))).toEqual({ status: "error" });
  });
});

describe("buildLeadEmail", () => {
  it("escapa l'HTML que escriu l'usuari", () => {
    const { html } = buildLeadEmail({ ...quote, message: "<script>alert(1)</script>" } as never);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("mailerFromEnv", () => {
  const never = () => {
    throw new Error("no s'hauria de crear cap client sense clau");
  };

  it("sense configuració de correu, valida igualment i retorna els camps invàlids", async () => {
    const config = mailerFromEnv({}, never);
    const result = await handleLead({ ...quote, email: "malament" }, { ...config, now: NOW });
    expect(result).toEqual({ status: "invalid", fields: ["email"] });
  });

  it("sense configuració de correu, una sol·licitud vàlida acaba en error", async () => {
    const config = mailerFromEnv({}, never);
    expect(await handleLead(quote, { ...config, now: NOW })).toEqual({ status: "error" });
  });

  it("amb configuració, crea el client amb la clau i usa remitent i destinatari", () => {
    const { mailer } = fakeMailer();
    const config = mailerFromEnv({ RESEND_API_KEY: "k", MAIL_FROM: "a@x", MAIL_TO: "b@x" }, (key) => {
      expect(key).toBe("k");
      return mailer;
    });
    expect(config).toEqual({ mailer, from: "a@x", to: "b@x" });
  });
});
