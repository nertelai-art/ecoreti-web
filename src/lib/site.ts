// Dades de l'empresa. Una sola font per a capçalera, peu, formularis i dades estructurades.
export const site = {
  name: "Eco-Reti 2030",
  legalName: "ECO RETI 2030 SLU",
  taxId: "B56642275",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://ecoreti2030.com").replace(/\/$/, ""),
  phone: "+34621041628",
  phoneDisplay: "+34 621 041 628",
  email: "info@ecoreti2030.com",
  address: {
    street: "Carrer Ramon Muntaner, 20",
    postalCode: "17458",
    locality: "Fornells de la Selva",
    region: "Girona",
    country: "ES",
  },
  // El web antic diu «8:00 - 17:00» sense dies. Suposem de dilluns a divendres: cal confirmar-ho.
  hours: { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "17:00" },
  registry: "Registre Mercantil de Girona, Tom 3461, Foli 146, Secció 8, Full GI-73747, Inscripció 1",
  areaServed: ["Girona", "Barcelona", "Tarragona", "Lleida"],
} as const;

export const whatsappUrl = `https://wa.me/${site.phone.replace("+", "")}`;
