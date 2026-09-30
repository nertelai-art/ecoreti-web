import { ContactPage, contactMetadata } from "@/views/pages";

export const generateMetadata = () => contactMetadata("ca");

export default function Page() {
  return <ContactPage locale="ca" />;
}
