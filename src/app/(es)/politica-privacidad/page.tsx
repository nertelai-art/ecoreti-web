import { LegalPage, legalMetadata } from "@/views/legal";

export const generateMetadata = () => legalMetadata("privacy", "es");

export default function Page() {
  return <LegalPage locale="es" page="privacy" />;
}
