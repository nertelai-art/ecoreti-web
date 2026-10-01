import { WebGLRenderer } from "three";
import { readPrefilteredEnvironment, type LightformerSpec } from "./environment-builder";

// Worker: calcula el mapa d'entorn en un context WebGL propi (OffscreenCanvas), fora del fil principal.

export type EnvironmentRequest = { lights: LightformerSpec[]; resolution: number };
export type EnvironmentResponse = { ok: true; data: Uint16Array; width: number; height: number } | { ok: false; error: string };

const scope = self as unknown as { postMessage(message: EnvironmentResponse, transfer?: Transferable[]): void; close(): void };

addEventListener("message", (event: MessageEvent<EnvironmentRequest>) => {
  try {
    const renderer = new WebGLRenderer({ canvas: new OffscreenCanvas(1, 1) });
    const result = readPrefilteredEnvironment(renderer, event.data.lights, event.data.resolution);
    renderer.dispose();
    if (result) scope.postMessage({ ok: true, ...result }, [result.data.buffer]);
    else scope.postMessage({ ok: false, error: "no es poden llegir textures de coma flotant" });
  } catch (error) {
    scope.postMessage({ ok: false, error: error instanceof Error ? error.message : String(error) });
  }
  scope.close();
});
