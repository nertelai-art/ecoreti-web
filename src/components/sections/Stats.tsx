"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/content";

type Stat = Dictionary["home"]["stats"][number];

function Counter({ stat, locale }: { stat: Stat; locale: string }) {
  // L'HTML del servidor porta el valor final: és el que llegeixen Google i els lectors de pantalla.
  const [value, setValue] = useState(stat.value);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / 1600);
        setValue(stat.value * (1 - Math.pow(1 - t, 4)));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      setValue(0);
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [stat.value]);

  const formatted = value.toLocaleString(locale, { minimumFractionDigits: stat.decimals, maximumFractionDigits: stat.decimals });
  return (
    <span ref={ref} className="tabular-nums">
      {stat.prefix}
      {formatted}
      <span className="text-leaf-400">{stat.suffix}</span>
    </span>
  );
}

export function Stats({ stats, locale }: { stats: Stat[]; locale: string }) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-white/10 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-ink-900 px-6 py-8 sm:px-8 sm:py-10">
          <dt className="text-sm font-medium uppercase tracking-wider text-ink-300">{stat.label}</dt>
          <dd className="mt-2 font-display text-5xl font-semibold text-white sm:text-6xl">
            <Counter stat={stat} locale={locale} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
