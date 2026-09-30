import { describe, expect, it } from "vitest";
import { seededRandom } from "./random";

describe("seededRandom", () => {
  it("la mateixa llavor dona la mateixa seqüència", () => {
    const a = seededRandom(42);
    const b = seededRandom(42);
    expect(Array.from({ length: 5 }, a)).toEqual(Array.from({ length: 5 }, b));
  });

  it("llavors diferents donen seqüències diferents", () => {
    expect(seededRandom(1)()).not.toBe(seededRandom(2)());
  });

  it("retorna valors a [0, 1)", () => {
    const next = seededRandom(7);
    for (let i = 0; i < 1000; i++) {
      const value = next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
