import { LegalPage, legalMetadata } from "@/views/legal";

export const generateMetadata = () => legalMetadata("legal", "es");

export default function Page() {
  return <LegalPage locale="es" page="legal" />;
}
