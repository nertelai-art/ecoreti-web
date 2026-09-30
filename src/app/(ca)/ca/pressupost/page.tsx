import { QuotePage, quoteMetadata } from "@/views/pages";

export const generateMetadata = () => quoteMetadata("ca");

export default function Page() {
  return <QuotePage locale="ca" />;
}
