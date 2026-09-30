import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./icons";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

export function Eyebrow({ children, tone = "dark" }: { children: ReactNode; tone?: "dark" | "light" }) {
  return (
    <p className={`inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] ${tone === "light" ? "text-leaf-400" : "text-leaf-700"}`}>
      <span className="h-0.5 w-6 rounded-full bg-leaf-500" aria-hidden="true" />
      {children}
    </p>
  );
}

export function SectionHeading({ eyebrow, title, lead, tone = "dark", align = "left" }: { eyebrow: string; title: string; lead?: string; tone?: "dark" | "light"; align?: "left" | "center" }) {
  return (
    <div data-reveal className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
      <h2 className={`mt-4 text-4xl font-semibold leading-[1.05] sm:text-5xl ${tone === "light" ? "text-white" : "text-ink-900"}`}>{title}</h2>
      {lead && <p className={`mt-5 text-lg leading-relaxed ${tone === "light" ? "text-ink-200" : "text-ink-600"}`}>{lead}</p>}
    </div>
  );
}

export function ButtonLink({ href, children, variant = "primary" }: { href: string; children: ReactNode; variant?: "primary" | "ghost" | "dark" }) {
  const styles = {
    primary: "bg-leaf-500 text-ink-950 shadow-xl shadow-leaf-500/25 hover:bg-leaf-400",
    ghost: "border border-white/30 text-white backdrop-blur hover:bg-white/10",
    dark: "bg-ink-900 text-white hover:bg-ink-800",
  }[variant];
  return (
    <Link href={href} className={`group inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-base font-semibold transition hover:-translate-y-0.5 ${styles}`}>
      {children}
      <Icon name="arrowRight" className="size-5 transition group-hover:translate-x-1" />
    </Link>
  );
}

/** L'ona del logo, com a element decoratiu. */
export function Wave({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 40" className={className} aria-hidden="true" preserveAspectRatio="none">
      <path d="M0 20 C 25 0, 50 0, 75 20 S 125 40, 150 20 S 200 0, 225 20 S 275 40, 300 20 S 350 0, 375 20 S 425 40, 450 20" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}
