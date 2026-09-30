import { describe, expect, it } from "vitest";
import { ROOF_PHASES, roofStep } from "./roof-phases";

describe("roofStep", () => {
  it("segueix l'ordre de l'obra al llarg del scroll", () => {
    expect(roofStep(0)).toBe(0);
    expect(roofStep(ROOF_PHASES.removal[0])).toBe(1);
    expect(roofStep(0.3)).toBe(1);
    expect(roofStep(ROOF_PHASES.newRoof[0])).toBe(2);
    expect(roofStep(ROOF_PHASES.solar[0])).toBe(3);
    expect(roofStep(1)).toBe(3);
  });

  it("les fases no deixen forats: cada una comença abans o quan acaba l'anterior", () => {
    expect(ROOF_PHASES.newRoof[0]).toBeLessThanOrEqual(ROOF_PHASES.removal[1]);
    expect(ROOF_PHASES.solar[0]).toBeLessThanOrEqual(ROOF_PHASES.newRoof[1]);
  });
});
