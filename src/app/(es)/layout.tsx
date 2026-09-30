import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { RootShell } from "@/components/RootShell";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  applicationName: site.name,
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#111920" };

export default function Layout({ children }: { children: ReactNode }) {
  return <RootShell locale="es">{children}</RootShell>;
}
