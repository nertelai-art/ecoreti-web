import { ServicesPage, servicesMetadata } from "@/views/pages";

export const generateMetadata = () => servicesMetadata("ca");

export default function Page() {
  return <ServicesPage locale="ca" />;
}
