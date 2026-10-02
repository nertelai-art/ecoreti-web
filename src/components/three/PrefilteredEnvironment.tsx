"use client";

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { ClampToEdgeWrapping, CubeUVReflectionMapping, DataTexture, HalfFloatType, LinearFilter, LinearSRGBColorSpace, RGBAFormat, type Texture } from "three";
import { renderPrefilteredEnvironment, type LightformerSpec, type PrefilteredEnvironment as EnvironmentPixels } from "./environment-builder";
import type { EnvironmentRequest, EnvironmentResponse } from "./environment.worker";

/** Textura ja prefiltrada: three.js la fa servir tal qual, sense tornar-la a processar. */
function toTexture({ data, width, height }: EnvironmentPixels): Texture {
  const texture = new DataTexture(data, width, height, RGBAFormat, HalfFloatType);
  texture.mapping = CubeUVReflectionMapping;
  texture.magFilter = texture.minFilter = LinearFilter;
  texture.wrapS = texture.wrapT = ClampToEdgeWrapping;
  texture.generateMipmaps = false;
  texture.colorSpace = LinearSRGBColorSpace;
  texture.name = "PMREM.cubeUv";
  texture.needsUpdate = true;
  return texture;
}

/**
 * Il·luminació d'estudi per a reflexos (substitueix `<Environment>` de drei).
 *
 * Prefiltrar el mapa d'entorn bloquejava el fil principal prop d'un segon per escena, i això és el
 * que Chrome avisava com a problema d'INP. Aquí es calcula en un worker i només se'n rep el
 * resultat. Si el navegador no té OffscreenCanvas o el worker falla, es calcula al fil principal
 * com abans: es veu igual, només que amb l'espera.
 */
export function PrefilteredEnvironment({ lights, resolution }: { lights: LightformerSpec[]; resolution: number }) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    let dispose: (() => void) | undefined;
    let cancelled = false;
    let worker: Worker | undefined;
    const previous = scene.environment;

    const apply = (texture: Texture, release: () => void) => {
      if (cancelled) return release();
      dispose = release;
      scene.environment = texture;
      invalidate();
    };
    const fromPixels = (pixels: EnvironmentPixels) => {
      const texture = toTexture(pixels);
      apply(texture, () => texture.dispose());
    };
    // Camí de reserva: mateix resultat, però el prefiltrat bloqueja el fil principal.
    const onMainThread = () => {
      const target = renderPrefilteredEnvironment(gl, lights, resolution);
      apply(target.texture, () => target.dispose());
    };

    if (typeof Worker === "undefined" || typeof OffscreenCanvas === "undefined") {
      onMainThread();
    } else {
      worker = new Worker(new URL("./environment.worker.ts", import.meta.url), { type: "module" });
      worker.onmessage = (event: MessageEvent<EnvironmentResponse>) => {
        if (event.data.ok) fromPixels(event.data);
        else if (!cancelled) onMainThread();
      };
      worker.onerror = () => {
        if (!cancelled) onMainThread();
      };
      worker.postMessage({ lights, resolution } satisfies EnvironmentRequest);
    }

    return () => {
      cancelled = true;
      worker?.terminate();
      scene.environment = previous;
      dispose?.();
    };
  }, [gl, scene, invalidate, lights, resolution]);

  return null;
}
