// Fases del scroll de la coberta (0-1). Fitxer a part perquè l'HTML les llegeixi sense carregar three.js.
export const ROOF_PHASES = { removal: [0.06, 0.5], newRoof: [0.48, 0.62], solar: [0.62, 0.93] } as const;

/** Pas actiu del text (0: uralita, 1: retirada, 2: coberta nova, 3: plaques solars). */
export function roofStep(progress: number) {
  if (progress < ROOF_PHASES.removal[0]) return 0;
  if (progress < ROOF_PHASES.newRoof[0]) return 1;
  if (progress < ROOF_PHASES.solar[0]) return 2;
  return 3;
}
