import { describe, expect, it } from "vitest";
import { fillRoundedRect } from "./rounded-rect";

function fakeContext(withRoundRect: boolean) {
  const calls: string[] = [];
  const record = (name: string) => () => void calls.push(name);
  const ctx = {
    beginPath: record("beginPath"),
    fill: record("fill"),
    rect: record("rect"),
    ...(withRoundRect ? { roundRect: record("roundRect") } : {}),
  };
  return { ctx: ctx as unknown as CanvasRenderingContext2D, calls };
}

describe("fillRoundedRect", () => {
  it("fa servir roundRect quan el navegador el té", () => {
    const { ctx, calls } = fakeContext(true);
    fillRoundedRect(ctx, 0, 0, 120, 14, 7);
    expect(calls).toEqual(["beginPath", "roundRect", "fill"]);
  });

  it("en navegadors sense roundRect dibuixa un rectangle en lloc de llançar un error", () => {
    const { ctx, calls } = fakeContext(false);
    expect(() => fillRoundedRect(ctx, 0, 0, 120, 14, 7)).not.toThrow();
    expect(calls).toEqual(["beginPath", "rect", "fill"]);
  });
});
