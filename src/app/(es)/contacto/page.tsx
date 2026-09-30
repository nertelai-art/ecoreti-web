import { ContactPage, contactMetadata } from "@/views/pages";

export const generateMetadata = () => contactMetadata("es");

export default function Page() {
  return <ContactPage locale="es" />;
}
