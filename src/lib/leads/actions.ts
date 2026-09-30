"use server";

import { createResendMailer } from "@/lib/email/resend";
import { handleLead, mailerFromEnv, type LeadResult } from "./handle-lead";
import { leadInputFromFormData } from "./schema";

export async function submitLead(_previous: LeadResult, formData: FormData): Promise<LeadResult> {
  return handleLead(leadInputFromFormData(formData), {
    ...mailerFromEnv(process.env, createResendMailer),
    now: Date.now(),
  });
}
