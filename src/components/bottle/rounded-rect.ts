/**
 * Omple un rectangle de cantonades arrodonides. `roundRect` no existeix en navegadors una mica
 * antics (Safari < 16, Firefox < 112): allà llançava un error i l'etiqueta de l'ampolla es quedava
 * en blanc. Si no hi és, es dibuixa un rectangle normal.
 */
export function fillRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, width, height, radius);
  else ctx.rect(x, y, width, height);
  ctx.fill();
}
