export function JsonLd({ data }: { data: unknown }) {
  // `<` s'escapa perquè cap text de l'usuari o del CMS pugui tancar l'etiqueta <script>.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
