import { AboutPage, aboutMetadata } from "@/views/pages";

export const generateMetadata = () => aboutMetadata("es");

export default function Page() {
  return <AboutPage locale="es" />;
}
