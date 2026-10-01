"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";

// Peces comunes de les escenes 3D guiades pel scroll (ampolles, coberta).

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

/** «3d», «static» (sense WebGL) o «pending» al servidor, fins que hidrata. */
export function useRenderMode() {
  return useSyncExternalStore(noop, () => (supportsWebGL() ? "3d" : "static"), () => "pending" as const);
}

export function useReducedMotion() {
  return useSyncExternalStore(subscribeReducedMotion, () => window.matchMedia(reducedMotionQuery).matches, () => false);
}

/** Executa `callback` quan el fil principal està lliure (o al cap de 2 s). Retorna com cancel·lar-ho. */
function whenIdle(callback: () => void) {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(callback, { timeout: 2000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(callback, 200);
  return () => window.clearTimeout(id);
}

/** Es torna `true` (per sempre) quan l'element és a menys de `margin` de la pantalla. */
export function useNearViewport(ref: RefObject<HTMLElement | null>, margin = "1500px") {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let idle: (() => void) | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          observer.disconnect();
          // Arrencar three.js i crear l'escena és feina pesada: esperem que el navegador estigui lliure
          // perquè no competeixi amb la càrrega de la pàgina ni amb una interacció de l'usuari.
          idle = whenIdle(() => setNear(true));
        }
      },
      { rootMargin: `${margin} 0px` },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      idle?.();
    };
  }, [ref, margin]);
  return near;
}

/**
 * Progrés (0-1) del scroll dins d'una secció alta amb contingut sticky. Es guarda en una ref i no
 * en estat: canvia a cada píxel i no volem re-renderitzar React. `onChange` permet tocar el DOM.
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>, onChange?: (progress: number) => void) {
  const progress = useRef(0);
  const callback = useRef(onChange);
  useEffect(() => {
    callback.current = onChange;
  });
  useEffect(() => {
    const update = () => {
      const element = ref.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const distance = rect.height - window.innerHeight;
      progress.current = distance > 0 ? Math.min(1, Math.max(0, -rect.top / distance)) : 1;
      callback.current?.(progress.current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ref]);
  return progress;
}
