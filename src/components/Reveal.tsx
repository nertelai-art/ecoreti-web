"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Mostra amb una transició els elements `[data-reveal]` quan entren a la pantalla. */
export function Reveal() {
  const pathname = usePathname();
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [pathname]);
  return null;
}
