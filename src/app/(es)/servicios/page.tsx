import { ServicesPage, servicesMetadata } from "@/views/pages";

export const generateMetadata = () => servicesMetadata("es");

export default function Page() {
  return <ServicesPage locale="es" />;
}
