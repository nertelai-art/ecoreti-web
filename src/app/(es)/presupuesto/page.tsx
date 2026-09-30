import { QuotePage, quoteMetadata } from "@/views/pages";

export const generateMetadata = () => quoteMetadata("es");

export default function Page() {
  return <QuotePage locale="es" />;
}
