"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRef } from "react";
import type { Dictionary } from "@/content";
import { useNearViewport, useReducedMotion, useRenderMode, useScrollProgress } from "../three/scroll-scene";
import { Eyebrow } from "../ui";
import { roofStep } from "./roof-phases";

// three.js només es descarrega quan la secció és a prop.
const RoofScene = dynamic(() => import("./RoofScene"), { ssr: false });

export function RoofShowcase({ t }: { t: Dictionary["roof"] }) {
  const section = useRef<HTMLElement>(null);
  const steps = useRef<HTMLOListElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const mode = useRenderMode();
  const reducedMotion = useReducedMotion();
  const near = useNearViewport(section);

  // El pas actiu i la barra es toquen directament al DOM: canvien a cada píxel de scroll.
  const progress = useScrollProgress(section, (value) => {
    const active = reducedMotion ? 3 : roofStep(value);
    steps.current?.querySelectorAll("li").forEach((item, index) => {
      item.dataset.state = index < active ? "done" : index === active ? "active" : "todo";
    });
    if (bar.current) bar.current.style.transform = `scaleX(${reducedMotion ? 1 : value})`;
  });

  const is3d = mode === "3d";

  return (
    <section
      ref={section}
      aria-labelledby="coberta-titol"
      className={`relative bg-gradient-to-b from-[#bfdcf0] via-[#e4eef4] to-[#eef2f3] ${is3d ? "h-[400vh]" : ""}`}
    >
      <div className={`${is3d ? "sticky top-0 h-[100svh]" : "py-24"} overflow-hidden`}>
        {is3d && near && (
          <div className="absolute inset-0">
            <RoofScene progress={progress} reducedMotion={reducedMotion} />
          </div>
        )}

        <div className="pointer-events-none relative mx-auto flex h-full max-w-7xl flex-col px-4 pt-24 sm:px-6 lg:justify-center lg:px-8 lg:pt-20">
          <div className="max-w-md lg:max-w-[36%]">
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <h2 id="coberta-titol" className="mt-4 text-4xl font-semibold leading-[1.02] text-ink-800 sm:text-5xl xl:text-6xl">
              {t.title} <span className="text-leaf-600">{t.accent}</span>
            </h2>
            <p className="mt-4 hidden text-lg leading-relaxed text-ink-700 sm:block [@media(max-height:700px)]:hidden">{t.lead}</p>

            <ol ref={steps} className="group/steps mt-6 grid gap-2 lg:mt-8 lg:gap-3">
              {t.steps.map((step, index) => (
                <li
                  key={step.title}
                  data-state={index === 0 ? "active" : "todo"}
                  className="flex gap-3 rounded-2xl p-2 transition-all duration-500 data-[state=active]:bg-white/80 data-[state=active]:shadow-sm data-[state=todo]:opacity-45 max-lg:[&:not([data-state=active])]:hidden lg:p-3"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink-800 font-display text-sm font-semibold text-white transition-colors duration-500 [[data-state=active]_&]:bg-leaf-500 [[data-state=active]_&]:text-ink-950">
                    {index + 1}
                  </span>
                  <span>
                    <span className="block font-semibold text-ink-900">{step.title}</span>
                    <span className="block text-sm leading-snug text-ink-600">{step.text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {mode === "static" && (
            <div className="relative mt-10 aspect-[4/3] w-full overflow-hidden rounded-3xl lg:absolute lg:right-8 lg:top-1/2 lg:mt-0 lg:w-[55%] lg:-translate-y-1/2">
              <Image src="/images/retirada-amiant-coberta-plaques-solars.jpg" alt={t.imageAlt} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
            </div>
          )}
        </div>

        {is3d && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-ink-900/10" aria-hidden="true">
            <div ref={bar} className="h-full origin-left scale-x-0 bg-leaf-500" />
          </div>
        )}
      </div>
    </section>
  );
}
