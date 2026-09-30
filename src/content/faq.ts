import type { Locale } from "@/lib/i18n";

// Respostes curtes i factuals: és el format que els cercadors i els assistents d'IA citen.
// PENDENT: que Eco-Reti validi les respostes abans de publicar (sobretot la d'ajuts).
export type FaqItem = { q: string; a: string };

export const faq: Record<Locale, FaqItem[]> = {
  es: [
    {
      q: "¿Cómo sé si mi cubierta tiene amianto?",
      a: "Las placas onduladas de fibrocemento, conocidas como uralita, instaladas antes de 2002 suelen contener amianto. También puede haberlo en depósitos de agua, bajantes, conductos y jardineras. Si tienes dudas, en la visita técnica valoramos el material y su estado.",
    },
    {
      q: "¿Puedo retirar la uralita yo mismo?",
      a: "No. El Real Decreto 396/2006 exige que la retirada la haga una empresa inscrita en el Registro de Empresas con Riesgo de Amianto (RERA), con un plan de trabajo aprobado por la autoridad laboral y trabajadores formados y protegidos. Eco-Reti 2030 está inscrita en el RERA.",
    },
    {
      q: "¿Es obligatorio retirar el amianto?",
      a: "La Ley 7/2022 de residuos obliga a los ayuntamientos a elaborar un censo de instalaciones con amianto y un calendario para retirarlas, con prioridad para los edificios de uso público. Si el material está deteriorado, roto o se deshace, conviene retirarlo cuanto antes porque es cuando puede liberar fibras.",
    },
    {
      q: "¿Qué es el plan de trabajo y quién lo tramita?",
      a: "Es el documento que describe cómo se hará la retirada: métodos, medidas de protección, gestión de residuos y controles. Se presenta a la autoridad laboral (en Cataluña, el Departament d'Empresa i Treball) y la obra no puede empezar hasta que se aprueba. Nosotros lo redactamos y lo tramitamos.",
    },
    {
      q: "¿Qué se hace con los residuos de amianto?",
      a: "Se humectan, se encapsulan en plástico, se etiquetan y los transporta un gestor autorizado hasta un vertedero autorizado. Al final de la obra te entregamos la documentación que acredita la correcta gestión.",
    },
    {
      q: "¿Cuánto cuesta retirar una cubierta de uralita?",
      a: "Depende de la superficie, la altura, los accesos, el estado del material y la cubierta nueva que se instale. Tras la visita técnica te enviamos un presupuesto detallado y sin sorpresas.",
    },
    {
      q: "¿Hay ayudas para retirar el amianto o renovar la cubierta?",
      a: "Existen líneas de ayuda a la rehabilitación y a la eficiencia energética que, según la convocatoria vigente, pueden cubrir parte de la obra. Te orientamos sobre las que puedan aplicarse a tu caso.",
    },
    {
      q: "¿En qué zonas trabajáis?",
      a: "Tenemos la sede en Fornells de la Selva (Girona) y trabajamos en toda Cataluña: provincias de Girona, Barcelona, Tarragona y Lleida.",
    },
  ],
  ca: [
    {
      q: "Com sé si la meva coberta té amiant?",
      a: "Les plaques ondulades de fibrociment, conegudes com a uralita, instal·lades abans del 2002 solen contenir amiant. També n'hi pot haver en dipòsits d'aigua, baixants, conductes i jardineres. Si tens dubtes, a la visita tècnica valorem el material i el seu estat.",
    },
    {
      q: "Puc retirar la uralita jo mateix?",
      a: "No. El Reial decret 396/2006 exigeix que la retirada la faci una empresa inscrita al Registre d'Empreses amb Risc d'Amiant (RERA), amb un pla de treball aprovat per l'autoritat laboral i treballadors formats i protegits. Eco-Reti 2030 està inscrita al RERA.",
    },
    {
      q: "És obligatori retirar l'amiant?",
      a: "La Llei 7/2022 de residus obliga els ajuntaments a elaborar un cens d'instal·lacions amb amiant i un calendari per retirar-les, amb prioritat per als edificis d'ús públic. Si el material està deteriorat, trencat o s'esmicola, convé retirar-lo com més aviat millor, perquè és quan pot alliberar fibres.",
    },
    {
      q: "Què és el pla de treball i qui el tramita?",
      a: "És el document que descriu com es farà la retirada: mètodes, mesures de protecció, gestió de residus i controls. Es presenta a l'autoritat laboral (a Catalunya, el Departament d'Empresa i Treball) i l'obra no pot començar fins que s'aprova. Nosaltres el redactem i el tramitem.",
    },
    {
      q: "Què es fa amb els residus d'amiant?",
      a: "S'humecten, s'encapsulen amb plàstic, s'etiqueten i un gestor autoritzat els transporta fins a un abocador autoritzat. En acabar l'obra et lliurem la documentació que n'acredita la gestió correcta.",
    },
    {
      q: "Quant costa retirar una coberta d'uralita?",
      a: "Depèn de la superfície, l'alçada, els accessos, l'estat del material i la coberta nova que s'instal·li. Després de la visita tècnica t'enviem un pressupost detallat i sense sorpreses.",
    },
    {
      q: "Hi ha ajuts per retirar l'amiant o renovar la coberta?",
      a: "Hi ha línies d'ajut a la rehabilitació i a l'eficiència energètica que, segons la convocatòria vigent, poden cobrir una part de l'obra. T'orientem sobre les que es puguin aplicar al teu cas.",
    },
    {
      q: "A quines zones treballeu?",
      a: "Tenim la seu a Fornells de la Selva (Girona) i treballem a tot Catalunya: demarcacions de Girona, Barcelona, Tarragona i Lleida.",
    },
  ],
};
