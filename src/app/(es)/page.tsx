import { HomePage, homeMetadata } from "@/views/home";

export const generateMetadata = () => homeMetadata("es");

export default function Page() {
  return <HomePage locale="es" />;
}
