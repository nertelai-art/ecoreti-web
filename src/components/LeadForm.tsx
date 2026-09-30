"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, type FormEvent, type ReactNode } from "react";
import type { Dictionary } from "@/content";
import { submitLead } from "@/lib/leads/actions";
import type { LeadResult } from "@/lib/leads/handle-lead";
import { propertyTypes, services, surfaces, type LeadField } from "@/lib/leads/schema";
import { routes, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { Icon } from "./icons";

const inputClass =
  "mt-2 block w-full rounded-2xl border-0 bg-mist px-4 py-3.5 text-base text-ink-900 ring-1 ring-transparent transition placeholder:text-ink-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf-500 aria-[invalid=true]:bg-red-50 aria-[invalid=true]:ring-red-400";

function Field({ id, label, error, required, requiredLabel, children, className = "" }: { id: string; label: string; error?: string; required?: boolean; requiredLabel: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-semibold text-ink-800">
        {label}
        {required && (
          <span className="text-leaf-700" aria-hidden="true"> *</span>
        )}
        {required && <span className="sr-only"> ({requiredLabel})</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function LeadForm({ kind, locale, t }: { kind: "quote" | "contact"; locale: Locale; t: Dictionary["form"] }) {
  const [state, action, pending] = useActionState<LeadResult, FormData>(submitLead, { status: "idle" });
  const startedAt = useRef<HTMLInputElement>(null);
  const status = useRef<HTMLDivElement>(null);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (startedAt.current) startedAt.current.value = String(Date.now());
  }, []);
  // Després d enviar, el focus va al primer camp amb error o al missatge de resultat.
  useEffect(() => {
    if (state.status === "invalid") form.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
    else if (state.status !== "idle") status.current?.focus();
  }, [state]);

  const invalid = new Set<LeadField>(state.status === "invalid" ? state.fields : []);
  const err = (field: LeadField) => (invalid.has(field) ? t.errors[field] : undefined);
  const a11y = (field: LeadField) => ({
    "aria-invalid": invalid.has(field) || undefined,
    "aria-describedby": invalid.has(field) ? `${kind}-${field}-error` : undefined,
  });
  const id = (field: string) => `${kind}-${field}`;

  // Amb JS enviem a mà: així React no buida el formulari si torna amb errors de validació.
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => action(formData));
  };

  if (state.status === "ok") {
    return (
      <div ref={status} tabIndex={-1} role="status" className="rounded-3xl bg-ink-900 p-10 text-center text-white outline-none">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-leaf-500 text-ink-950">
          <Icon name="check" className="size-8" />
        </span>
        <h2 className="mt-6 text-3xl font-semibold">{t.successTitle}</h2>
        <p className="mx-auto mt-3 max-w-md text-lg text-ink-200">{t.successText}</p>
      </div>
    );
  }

  return (
    <form ref={form} action={action} onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="locale" value={locale} />
      <input ref={startedAt} type="hidden" name="startedAt" defaultValue="0" />
      {/* Camp trampa: invisible per a persones, els bots l'omplen. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div ref={status} tabIndex={-1} className="outline-none sm:col-span-2" aria-live="polite">
        {state.status === "error" && (
          <p className="rounded-2xl bg-red-50 px-5 py-4 font-medium text-red-700">
            {t.errorGeneric} <a href={`tel:${site.phone}`} className="underline">{site.phoneDisplay}</a>.
          </p>
        )}
      </div>

      <Field id={id("name")} label={t.name} error={err("name")} required requiredLabel={t.required} className="sm:col-span-2">
        <input id={id("name")} name="name" type="text" autoComplete="name" required maxLength={120} className={inputClass} {...a11y("name")} />
      </Field>
      <Field id={id("email")} label={t.email} error={err("email")} required requiredLabel={t.required}>
        <input id={id("email")} name="email" type="email" autoComplete="email" required maxLength={200} className={inputClass} {...a11y("email")} />
      </Field>
      <Field id={id("phone")} label={t.phone} error={err("phone")} required requiredLabel={t.required}>
        <input id={id("phone")} name="phone" type="tel" autoComplete="tel" inputMode="tel" required maxLength={25} className={inputClass} {...a11y("phone")} />
      </Field>

      {kind === "quote" && (
        <>
          <Field id={id("propertyType")} label={t.propertyType} error={err("propertyType")} required requiredLabel={t.required}>
            <select id={id("propertyType")} name="propertyType" required defaultValue="" className={inputClass} {...a11y("propertyType")}>
              <option value="" disabled>{t.select}</option>
              {propertyTypes.map((value) => (
                <option key={value} value={value}>{t.propertyTypes[value]}</option>
              ))}
            </select>
          </Field>
          <Field id={id("municipality")} label={t.municipality} error={err("municipality")} required requiredLabel={t.required}>
            <input id={id("municipality")} name="municipality" type="text" autoComplete="address-level2" required maxLength={120} className={inputClass} {...a11y("municipality")} />
          </Field>
          <Field id={id("service")} label={t.service} error={err("service")} required requiredLabel={t.required}>
            <select id={id("service")} name="service" required defaultValue="" className={inputClass} {...a11y("service")}>
              <option value="" disabled>{t.select}</option>
              {services.map((value) => (
                <option key={value} value={value}>{t.services[value]}</option>
              ))}
            </select>
          </Field>
          <Field id={id("surface")} label={t.surface} requiredLabel={t.required}>
            <select id={id("surface")} name="surface" defaultValue="" className={inputClass}>
              <option value="">{t.select}</option>
              {surfaces.map((value) => (
                <option key={value} value={value}>{t.surfaces[value]}</option>
              ))}
            </select>
          </Field>
        </>
      )}

      <Field
        id={id("message")}
        label={kind === "quote" ? t.messageQuote : t.message}
        error={err("message")}
        required={kind === "contact"}
        requiredLabel={t.required}
        className="sm:col-span-2"
      >
        <textarea
          id={id("message")}
          name="message"
          rows={5}
          maxLength={4000}
          required={kind === "contact"}
          placeholder={t.messagePlaceholder}
          className={`${inputClass} resize-y`}
          {...a11y("message")}
        />
      </Field>

      <div className="sm:col-span-2">
        <label className="flex items-start gap-3 text-[15px] text-ink-700">
          <input
            id={id("privacy")}
            type="checkbox"
            name="privacy"
            required
            className="mt-0.5 size-5 shrink-0 rounded accent-leaf-600"
            {...a11y("privacy")}
            aria-describedby={invalid.has("privacy") ? `${kind}-privacy-error` : undefined}
          />
          <span>
            {t.privacy}{" "}
            <Link href={routes.privacy[locale]} className="font-semibold text-ink-900 underline decoration-leaf-500 decoration-2 underline-offset-4">
              {t.privacyLink}
            </Link>
            <span className="text-leaf-700" aria-hidden="true"> *</span>
          </span>
        </label>
        {invalid.has("privacy") && (
          <p id={`${kind}-privacy-error`} className="mt-2 text-sm font-medium text-red-600">{t.errors.privacy}</p>
        )}
      </div>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-leaf-500 px-8 py-4 text-lg font-semibold text-ink-950 shadow-xl shadow-leaf-500/25 transition hover:-translate-y-0.5 hover:bg-leaf-400 disabled:translate-y-0 disabled:opacity-60 sm:w-auto"
        >
          {pending ? t.sending : kind === "quote" ? t.submit : t.submitContact}
          {!pending && <Icon name="arrowRight" className="size-5" />}
        </button>
      </div>
    </form>
  );
}
