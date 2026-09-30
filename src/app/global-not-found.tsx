import type { Metadata } from "next";
import { RootShell } from "@/components/RootShell";
import { NotFoundView } from "@/views/not-found";

// Amb un layout arrel per idioma, les URL que no coincideixen amb cap cauen aquí.
export const metadata: Metadata = { title: "404 | Eco-Reti 2030", robots: { index: false } };

export default function GlobalNotFound() {
  return (
    <RootShell locale="es">
      <NotFoundView locale="es" />
    </RootShell>
  );
}
