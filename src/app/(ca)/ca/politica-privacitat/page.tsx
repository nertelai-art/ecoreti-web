import { LegalPage, legalMetadata } from "@/views/legal";

export const generateMetadata = () => legalMetadata("privacy", "ca");

export default function Page() {
  return <LegalPage locale="ca" page="privacy" />;
}
