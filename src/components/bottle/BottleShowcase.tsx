"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Dictionary } from "@/content";
import { Icon, type IconName } from "../icons";
import { Eyebrow } from "../ui";

// three.js pesa: només es descarrega quan la secció és a prop de la pantalla.
const BottleScene = dynamic(() => import("./BottleScene"), { ssr: false });

const valueIcons: IconName[] = ["leaf", "recycle", "globe", "users"];

let webgl: boolean | undefined;
function supportsWebGL() {
  if (webgl === undefined) {
    try {
      const canvas = document.createElement("canvas");
      webgl = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
    } catch {
      webgl = false;
    }
  }
  return webgl;
}

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const noop = () => () => {};
const subscribeReducedMotion = (callback: () => void) => {
  const media = window.matchMedia(reducedMotionQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};

// Al servidor no sabem res del navegador: «pending» fins que hidrata.
function useRenderMode() {
  return useSyncExternalStore(noop, () => (supportsWebGL() ? "3d" : "static"), () => "pending" as const);
}
function useReducedMotion() {
  return useSyncExternalStore(subscribeReducedMotion, () => window.matchMedia(reducedMotionQuery).matches, () => false);
}

export function BottleShowcase({ t }: { t: Dictionary["bottle"] }) {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const captions = useRef<HTMLDivElement>(null);
  const mode = useRenderMode();
  const reducedMotion = useReducedMotion();
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = section.current;
    if (!element) return;
    const nearObserver = new IntersectionObserver(([entry]) => entry?.isIntersecting && setNear(true), { rootMargin: "800px 0px" });
    const visibleObserver = new IntersectionObserver(([entry]) => setVisible(Boolean(entry?.isIntersecting)));
    nearObserver.observe(element);
    visibleObserver.observe(element);
    return () => {
      nearObserver.disconnect();
      visibleObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const element = section.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const distance = rect.height - window.innerHeight;
      progress.current = distance > 0 ? Math.min(1, Math.max(0, -rect.top / distance)) : 1;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Els rètols «Frontal / Posterior» apareixen quan les ampolles aterren, sense re-renderitzar React.
  const onSettle = useCallback((settle: number) => {
    if (captions.current) captions.current.style.opacity = String(settle);
  }, []);

  const is3d = mode === "3d";

  return (
    <section ref={section} aria-labelledby="ampolla-titol" className={`relative bg-mist ${is3d ? "h-[280vh]" : ""}`}>
      <div className={`${is3d ? "sticky top-0 h-[100svh]" : "py-24"} overflow-hidden`}>
        {is3d && near && (
          <div className="absolute inset-0">
            <BottleScene progress={progress} onSettle={onSettle} reducedMotion={reducedMotion} active={visible} />
          </div>
        )}

        <div className="pointer-events-none relative mx-auto flex h-full max-w-7xl flex-col px-4 pt-24 sm:px-6 lg:justify-center lg:px-8 lg:pt-20">
          <div className="max-w-md lg:max-w-[40%]">
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <h2 id="ampolla-titol" className="mt-4 text-4xl font-semibold leading-[1.02] text-ink-700 sm:text-5xl xl:text-6xl">
              {t.title} <span className="text-leaf-600">{t.accent}</span>
            </h2>
            <p className="mt-5 hidden text-lg leading-relaxed text-ink-600 sm:block [@media(max-height:700px)]:hidden">{t.lead}</p>
            <ul className="mt-8 hidden gap-4 lg:grid">
              {t.values.map((value, index) => (
                <li key={value} className="flex items-center gap-4 text-sm font-semibold uppercase tracking-[0.14em] text-ink-600">
                  <span className="grid size-11 place-items-center rounded-full border border-leaf-500/40 bg-white/60 text-leaf-600">
                    <Icon name={valueIcons[index] ?? "leaf"} className="size-5" />
                  </span>
                  {value}
                </li>
              ))}
            </ul>
            <p className="mt-8 hidden font-display text-2xl font-semibold text-ink-700 lg:block [@media(max-height:860px)]:lg:hidden">{t.claim}</p>
          </div>

          {mode === "static" && (
            <div className="relative mt-10 aspect-[3/2] w-full overflow-hidden rounded-3xl lg:absolute lg:right-8 lg:top-1/2 lg:mt-0 lg:w-[55%] lg:-translate-y-1/2">
              <Image src="/images/ampolla-eco-reti.jpg" alt={t.imageAlt} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
            </div>
          )}
        </div>

        {is3d && (
          <div
            ref={captions}
            aria-hidden="true"
            style={{ opacity: 0 }}
            className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center gap-[18vw] text-xs font-semibold uppercase tracking-[0.3em] text-ink-700 transition-opacity lg:bottom-10 lg:left-[40%] lg:gap-[12vw]"
          >
            <span>{t.front}</span>
            <span>{t.back}</span>
          </div>
        )}

        {/* Per a lectors de pantalla i cercadors: el contingut de l'ampolla com a text. */}
        <p className="sr-only">
          {t.imageAlt}. {t.values.join(". ")}. {t.claim}
        </p>
      </div>
    </section>
  );
}
