import { AboutPage, aboutMetadata } from "@/views/pages";

export const generateMetadata = () => aboutMetadata("ca");

export default function Page() {
  return <AboutPage locale="ca" />;
}
