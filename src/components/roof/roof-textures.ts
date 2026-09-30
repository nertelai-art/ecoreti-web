import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";
import { seededRandom } from "@/lib/random";

// Textures dibuixades en un canvas: res a descarregar, i sempre iguals (atzar amb llavor).

function canvasTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext("2d")!);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** Paret de maó de nau industrial, amb una franja de finestres com a les fotos d'obra. */
export function brickTexture() {
  const random = seededRandom(11);
  const texture = canvasTexture(512, 256, (ctx) => {
    ctx.fillStyle = "#8e4f3a";
    ctx.fillRect(0, 0, 512, 256);
    const bw = 32;
    const bh = 12;
    for (let row = 0; row * bh < 256; row++) {
      const offset = row % 2 ? bw / 2 : 0;
      for (let x = -bw; x < 512; x += bw) {
        const tone = 0.85 + random() * 0.3;
        ctx.fillStyle = `rgb(${Math.round(160 * tone)}, ${Math.round(88 * tone)}, ${Math.round(62 * tone)})`;
        ctx.fillRect(x + offset + 1, row * bh + 1, bw - 2, bh - 2);
      }
    }
    // Franja de finestres
    for (let x = 16; x < 512; x += 64) {
      ctx.fillStyle = "#3b4a52";
      ctx.fillRect(x, 70, 44, 40);
      ctx.fillStyle = "#6f8791";
      ctx.fillRect(x + 3, 73, 18, 34);
      ctx.fillRect(x + 23, 73, 18, 34);
    }
  });
  texture.wrapS = texture.wrapT = RepeatWrapping;
  return texture;
}

/** Fibrociment envellit: gris beix amb taques de líquen i brutícia. */
export function fibrocementTexture() {
  const random = seededRandom(23);
  return canvasTexture(256, 256, (ctx) => {
    ctx.fillStyle = "#a39d90";
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 900; i++) {
      const shade = 120 + Math.floor(random() * 60);
      ctx.fillStyle = `rgba(${shade}, ${shade - 6}, ${shade - 16}, 0.25)`;
      ctx.fillRect(random() * 256, random() * 256, 2 + random() * 5, 2 + random() * 5);
    }
    for (let i = 0; i < 26; i++) {
      const x = random() * 256;
      const y = random() * 256;
      const r = 4 + random() * 16;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
      const lichen = random() > 0.5 ? "196, 164, 72" : "92, 88, 70";
      gradient.addColorStop(0, `rgba(${lichen}, 0.55)`);
      gradient.addColorStop(1, `rgba(${lichen}, 0)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
  });
}

/** Mòdul fotovoltaic: cel·les blau fosc, busbars i marc d'alumini. */
export function solarTexture() {
  return canvasTexture(256, 384, (ctx) => {
    ctx.fillStyle = "#c9ced2";
    ctx.fillRect(0, 0, 256, 384);
    const cols = 6;
    const rows = 10;
    const pad = 8;
    const gap = 3;
    const cw = (256 - pad * 2 - gap * (cols - 1)) / cols;
    const ch = (384 - pad * 2 - gap * (rows - 1)) / rows;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const x = pad + c * (cw + gap);
        const y = pad + r * (ch + gap);
        const gradient = ctx.createLinearGradient(x, y, x + cw, y + ch);
        gradient.addColorStop(0, "#1d2d52");
        gradient.addColorStop(1, "#142140");
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, cw, ch);
        ctx.fillStyle = "rgba(190, 200, 215, 0.35)";
        ctx.fillRect(x + cw / 3, y, 1, ch);
        ctx.fillRect(x + (2 * cw) / 3, y, 1, ch);
      }
    }
  });
}

/** Màscara radial (blanc al centre, negre a la vora) per esvair el terra. */
export function radialFade() {
  const texture = canvasTexture(128, 128, (ctx) => {
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "#fff");
    gradient.addColorStop(0.55, "#fff");
    gradient.addColorStop(1, "#000");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
  });
  texture.colorSpace = "";
  return texture;
}
