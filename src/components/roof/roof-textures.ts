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

// Escala comuna de les parets: 192 px per metre, perquè el maó mesuri igual a totes les cares.
const PX_PER_M = 192;
const BRICK_W = 40; // ≈ 21 cm
const BRICK_H = 11; // ≈ 6 cm amb el morter

function drawBricks(ctx: CanvasRenderingContext2D, width: number, height: number, seed: number) {
  const random = seededRandom(seed);
  ctx.fillStyle = "#8a5040";
  ctx.fillRect(0, 0, width, height);
  for (let row = 0; row * BRICK_H < height; row++) {
    const offset = row % 2 ? BRICK_W / 2 : 0;
    for (let x = -BRICK_W; x < width; x += BRICK_W) {
      const tone = 0.86 + random() * 0.26;
      ctx.fillStyle = `rgb(${Math.round(158 * tone)}, ${Math.round(86 * tone)}, ${Math.round(60 * tone)})`;
      ctx.fillRect(x + offset + 1, row * BRICK_H + 1, BRICK_W - 2, BRICK_H - 2);
    }
  }
}

/** Finestra de nau: marc d'acer, tres fulles, vidre amb reflex i ampit de formigó. */
function drawWindow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
  ctx.fillStyle = "#2f3a40";
  ctx.fillRect(x, y, w, h);
  const frame = 7;
  const panes = 3;
  const paneW = (w - frame * (panes + 1)) / panes;
  for (let i = 0; i < panes; i++) {
    const px = x + frame + i * (paneW + frame);
    const glass = ctx.createLinearGradient(px, y, px + paneW, y + h);
    glass.addColorStop(0, "#9fb6c2");
    glass.addColorStop(0.45, "#5f7885");
    glass.addColorStop(1, "#3d525d");
    ctx.fillStyle = glass;
    ctx.fillRect(px, y + frame, paneW, h - frame * 2);
    // Reflex en diagonal
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, y + frame, paneW, h - frame * 2);
    ctx.clip();
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.beginPath();
    ctx.moveTo(px + paneW * 0.2, y);
    ctx.lineTo(px + paneW * 0.55, y);
    ctx.lineTo(px + paneW * 0.15, y + h);
    ctx.lineTo(px - paneW * 0.2, y + h);
    ctx.fill();
    ctx.restore();
    // Travesser horitzontal
    ctx.fillStyle = "#2f3a40";
    ctx.fillRect(px, y + h * 0.42, paneW, 5);
  }
  ctx.fillStyle = "#c9c3b8";
  ctx.fillRect(x - 10, y + h, w + 20, 10);
}

function wallTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const texture = canvasTexture(width, height, draw);
  texture.wrapS = RepeatWrapping;
  return texture;
}

/** Tram de paret llarga (≈2,7 m): maó i una finestra gran. Es repeteix al llarg de la nau. */
export function longWallTexture(segmentMeters: number, heightMeters: number) {
  const width = Math.round(segmentMeters * PX_PER_M);
  const height = Math.round(heightMeters * PX_PER_M);
  return wallTexture(width, height, (ctx) => {
    drawBricks(ctx, width, height, 11);
    const w = 1.45 * PX_PER_M;
    const h = 0.8 * PX_PER_M;
    drawWindow(ctx, (width - w) / 2, height * 0.18, w, h);
  });
}

/** Paret curta: maó i una porta industrial de persiana. */
export function endWallTexture(widthMeters: number, heightMeters: number) {
  const width = Math.round(widthMeters * PX_PER_M);
  const height = Math.round(heightMeters * PX_PER_M);
  return wallTexture(width, height, (ctx) => {
    drawBricks(ctx, width, height, 17);
    const w = 2.1 * PX_PER_M;
    const h = 1.75 * PX_PER_M;
    const x = (width - w) / 2;
    const y = height - h;
    ctx.fillStyle = "#6b7378";
    ctx.fillRect(x - 8, y - 8, w + 16, h + 8);
    for (let slat = y; slat < height; slat += 12) {
      ctx.fillStyle = (slat - y) % 24 ? "#b8bfc3" : "#a5adb2";
      ctx.fillRect(x, slat, w, 11);
    }
  });
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
