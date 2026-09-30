import { LegalPage, legalMetadata } from "@/views/legal";

export const generateMetadata = () => legalMetadata("cookies", "es");

export default function Page() {
  return <LegalPage locale="es" page="cookies" />;
}
