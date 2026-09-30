// Prepara les imatges del web a partir del rascat del WordPress (scrape/images).
// Execució: node scripts/prepare-images.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const SRC = "scrape/images";
const OUT = "public/images";
mkdirSync(OUT, { recursive: true });
mkdirSync(`${OUT}/logos`, { recursive: true });

const photos = {
  "cubierta-renovada.webp-1.jpeg": "retirada-amiant-coberta-plaques-solars.jpg",
  "retirada-amianto.jpeg": "coberta-fibrociment-amiant-nau-industrial.jpg",
  "proyecto-ecoreti.jpeg": "residus-amiant-encapsulats.jpg",
  "renovacion-cubierta-e1784928172255.jpeg": "gestio-residus-amiant-obra.jpg",
  "obra-finalizada.jpeg": "coberta-nova-panell-sandvitx.jpg",
  "asesoramiento-tecnico.jpeg": "coberta-renovada-nau.jpg",
  "eficiencia-energetica-1-e1784927846347.jpeg": "eficiencia-energetica-coberta.jpg",
  "equipo-trabajando.jpeg": "treballs-seguretat-xarxes-coberta.jpg",
  "panel-sandwich.jpeg": "substitucio-coberta-panell.jpg",
  "cubierta-residencial-1-e1784752929328.jpeg": "materials-retirats-palets.jpg",
  "visita-tecnica-e1784752870547.jpeg": "estructura-metallica-retirada.jpg",
};

for (const [src, out] of Object.entries(photos)) {
  await sharp(`${SRC}/${src}`)
    .rotate()
    .resize(2000, 2000, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(`${OUT}/${out}`);
}

// La proposta porta rètols impresos («PROPOSTA 1», «FRONTAL», «POSTERIOR»): els retallem.
await sharp(`${SRC}/ampolla-proposta-1.jpg`)
  .extract({ left: 0, top: 115, width: 1536, height: 830 })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(`${OUT}/ampolla-eco-reti.jpg`);

const logos = {
  "eco-reti-logo-transparent.png": "eco-reti.png",
  "banner-1.png": "kit-digital.png",
  "ES_Financiado_por_la_Union_Europea2-1024x256-1.png": "financiado-ue-nextgeneration.png",
  "Logo-PRTR-tres-lineas_COLOR.png": "prtr.png",
  "logo-rera-transparente-rqwfbfyzgyp9113vvra9s9kgz5s0n042257cf1pewu.png": "rera.png",
};
for (const [src, out] of Object.entries(logos)) {
  await sharp(`${SRC}/${src}`).trim().png({ compressionLevel: 9 }).toFile(`${OUT}/logos/${out}`);
}

// Favicon i icona: la «e» del logo, retallada i centrada en un quadrat.
const mark = await sharp(`${SRC}/eco-reti-logo-transparent.png`)
  .extract({ left: 470, top: 0, width: 720, height: 662 })
  .trim()
  .toBuffer();
const square = (size, pad, bg) =>
  sharp(mark)
    .resize(size - pad * 2, size - pad * 2, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: bg })
    .png();
await square(512, 40, { r: 0, g: 0, b: 0, alpha: 0 }).toFile("src/app/icon.png");
await square(180, 22, { r: 255, g: 255, b: 255, alpha: 1 }).toFile("src/app/apple-icon.png");
// Imatge per compartir a xarxes (Open Graph): foto d'obra, degradat i logo sobre una targeta blanca.
const logoCard = await sharp(`${SRC}/eco-reti-logo-transparent.png`).trim().resize({ width: 380 }).toBuffer();
const logoMeta = await sharp(logoCard).metadata();
const card = await sharp({ create: { width: 460, height: logoMeta.height + 80, channels: 4, background: "#ffffff" } })
  .composite([{ input: logoCard, left: 40, top: 40 }])
  .png()
  .toBuffer();
const overlay = Buffer.from(
  `<svg width="1200" height="630"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#111920" stop-opacity="0.92"/><stop offset="1" stop-color="#111920" stop-opacity="0.2"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <text x="70" y="470" font-family="Arial, sans-serif" font-size="58" font-weight="700" fill="#ffffff">Retirada de amianto</text>
  <text x="70" y="540" font-family="Arial, sans-serif" font-size="58" font-weight="700" fill="#9ad84f">y renovación de cubiertas</text></svg>`,
);
await sharp(`${SRC}/cubierta-renovada.webp-1.jpeg`)
  .resize(1200, 630, { fit: "cover" })
  .composite([{ input: overlay }, { input: card, left: 70, top: 70 }])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(`${OUT}/og.jpg`);

console.log("imatges preparades");
