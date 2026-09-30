import { LegalPage, legalMetadata } from "@/views/legal";

export const generateMetadata = () => legalMetadata("legal", "ca");

export default function Page() {
  return <LegalPage locale="ca" page="legal" />;
}
