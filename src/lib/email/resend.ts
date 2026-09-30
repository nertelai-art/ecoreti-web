import "server-only";
import { Resend } from "resend";
import type { Mailer } from "@/lib/leads/handle-lead";

// Frontera amb el proveïdor de correu: l'únic fitxer que coneix Resend.
export function createResendMailer(apiKey: string): Mailer {
  const resend = new Resend(apiKey);
  return {
    async send(mail) {
      const { error } = await resend.emails.send(mail);
      if (error) throw new Error(`Resend: ${error.name} ${error.message}`);
    },
  };
}
