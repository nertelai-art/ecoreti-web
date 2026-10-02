import { CanvasTexture, SRGBColorSpace } from "three";
import { iconPaths, type IconName } from "../icons";
import { fillRoundedRect } from "./rounded-rect";

// Geometria de l'etiqueta: un cilindre obert una mica més gran que el vidre.
export const LABEL_RADIUS = 0.626;
export const LABEL_HEIGHT = 2.75;

// La textura cobreix tota la circumferència: la meitat esquerra és el frontal i la dreta, el posterior.
const W = 2048;
const H = Math.round((W * LABEL_HEIGHT) / (2 * Math.PI * LABEL_RADIUS));
const FRONT_X = W / 4;
const BACK_X = (W * 3) / 4;

const INK = "#476577";
const LEAF = "#7dc62b";

type Segment = { text: string; color?: string };

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawIcon(ctx: CanvasRenderingContext2D, name: IconName, x: number, y: number, size: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 24, size / 24);
  ctx.strokeStyle = LEAF;
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const d of iconPaths[name]) ctx.stroke(new Path2D(d));
  ctx.restore();
}

function drawLine(ctx: CanvasRenderingContext2D, segments: Segment[], x: number, y: number) {
  let cursor = x;
  for (const segment of segments) {
    ctx.fillStyle = segment.color ?? INK;
    ctx.fillText(segment.text, cursor, y);
    cursor += ctx.measureText(segment.text).width;
  }
}

function drawCaps(ctx: CanvasRenderingContext2D, lines: string[], x: number, y: number, family: string) {
  ctx.font = `500 36px ${family}`;
  ctx.letterSpacing = "4px";
  ctx.fillStyle = INK;
  lines.forEach((line, i) => ctx.fillText(line, x, y + i * 50));
  ctx.letterSpacing = "0px";
}

/**
 * Crea la textura de la impressió (proposta 1) buida i la dibuixa quan tenim tipografia i logo.
 * La textura existeix des del primer fotograma perquè el material es compili una sola vegada:
 * si arribés més tard, el canvi de shader faria una estrebada en plena animació.
 */
export function createLabelTexture(): { texture: CanvasTexture; ready: Promise<void> } {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  // Passi el que passi, la textura es torna a pujar amb el que s'hagi pogut dibuixar: un error a
  // mig camí no ha de deixar l'ampolla en blanc.
  const ready = drawLabel(canvas)
    .catch((error) => console.error("[ampolla] etiqueta incompleta:", error instanceof Error ? error.message : String(error)))
    .then(() => {
      texture.needsUpdate = true;
    });
  return { texture, ready };
}

async function drawLabel(canvas: HTMLCanvasElement) {
  const family = getComputedStyle(document.documentElement).getPropertyValue("--font-barlow").trim() || "sans-serif";
  // Cada recurs tolera el seu error: sense tipografia es dibuixa amb la de reserva, i sense logo
  // es dibuixa la resta de la impressió.
  const [logo] = await Promise.all([
    loadImage("/images/logos/eco-reti.png").catch(() => null),
    document.fonts.load(`600 80px ${family}`).catch(() => undefined),
    document.fonts.load(`500 36px ${family}`).catch(() => undefined),
  ]);

  const ctx = canvas.getContext("2d")!;
  ctx.textBaseline = "alphabetic";

  // ── Frontal ──
  const logoWidth = 540;
  if (logo) ctx.drawImage(logo, FRONT_X - logoWidth / 2, 70, logoWidth, (logoWidth * logo.height) / logo.width);

  const left = FRONT_X - 250;
  ctx.fillStyle = LEAF;
  fillRoundedRect(ctx, left, 480, 120, 14, 7);

  ctx.font = `600 84px ${family}`;
  const headline: Segment[][] = [[{ text: "Avancem" }], [{ text: "cap a un" }], [{ text: "futur més" }], [{ text: "segur.", color: LEAF }]];
  headline.forEach((line, i) => drawLine(ctx, line, left, 610 + i * 96));

  drawIcon(ctx, "leaf", left, 1050, 150);
  drawCaps(ctx, ["PERSONES", "ENTORNS", "SOLUCIONS", "SOSTENIBLES"], left + 200, 1080, family);

  // ── Posterior ──
  const backLeft = BACK_X - 270;
  const rows: { icon: IconName; lines: string[] }[] = [
    { icon: "leaf", lines: ["RETIRAR", "AMB SEGURETAT"] },
    { icon: "recycle", lines: ["PROTEGIR", "LES PERSONES"] },
    { icon: "globe", lines: ["RECUPERAR", "ELS ENTORNS"] },
    { icon: "users", lines: ["CONSTRUIR", "UN DEMÀ", "MÉS SOSTENIBLE"] },
  ];
  rows.forEach((row, i) => {
    const y = 110 + i * 235;
    drawIcon(ctx, row.icon, backLeft, y, 120);
    drawCaps(ctx, row.lines, backLeft + 175, y + 40, family);
  });

  ctx.fillStyle = LEAF;
  fillRoundedRect(ctx, backLeft, 1110, 120, 14, 7);

  ctx.font = `600 62px ${family}`;
  const claim: Segment[][] = [
    [{ text: "Compromesos" }],
    [{ text: "amb les " }, { text: "persones", color: LEAF }],
    [{ text: "i el " }, { text: "territori.", color: LEAF }],
  ];
  claim.forEach((line, i) => drawLine(ctx, line, backLeft, 1210 + i * 74));
}
