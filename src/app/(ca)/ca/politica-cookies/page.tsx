import { LegalPage, legalMetadata } from "@/views/legal";

export const generateMetadata = () => legalMetadata("cookies", "ca");

export default function Page() {
  return <LegalPage locale="ca" page="cookies" />;
}
