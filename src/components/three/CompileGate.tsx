"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useState, type ReactNode } from "react";

type Phase = "environment" | "compiling" | "ready";

// Si la compilació en segon pla no acaba (controlador antic, context perdut), pintem igualment.
const COMPILE_TIMEOUT_MS = 4000;
// Si el mapa d'entorn no arriba (worker i camí de reserva fallits), pintem sense reflexos abans que res.
const ENVIRONMENT_TIMEOUT_MS = 5000;

/**
 * Evita que el primer pintat de l'escena bloquegi la pàgina.
 *
 * El navegador compila i enllaça els shaders la primera vegada que es fan servir, i s'hi espera de
 * manera síncrona: amb una desena de materials són centenars de mil·lisegons (més d'un segon a
 * Windows) en què la pàgina no respon a clics ni tocs, i això enfonsa l'INP.
 *
 * Aquí ho fem en tres passos:
 * 1. «environment»: es pinta l'escena buida fins que el mapa d'entorn existeix. Els materials
 *    depenen d'ell; compilar-los abans voldria dir recompilar-los després.
 * 2. «compiling»: bucle aturat i `compileAsync`, que compila en segon pla sense bloquejar.
 * 3. «ready»: es reprèn el bucle sota demanda i es pinta, ja sense cap espera.
 */
export function CompileGate({ name, children }: { name: string; children: ReactNode }) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);
  const setFrameloop = useThree((state) => state.setFrameloop);
  const [phase, setPhase] = useState<Phase>("environment");

  useEffect(() => {
    if (phase !== "environment") return;
    const timeout = window.setTimeout(() => setPhase("compiling"), ENVIRONMENT_TIMEOUT_MS);
    return () => window.clearTimeout(timeout);
  }, [phase]);

  useFrame(() => {
    if (phase !== "environment") return;
    if (scene.environment) setPhase("compiling");
    else invalidate();
  });

  useEffect(() => {
    if (phase !== "compiling") return;
    let done = false;
    const started = performance.now();
    const finish = () => {
      if (done) return;
      done = true;
      // Visible a la pestanya Performance de les eines del navegador, per poder-ho mesurar.
      performance.measure(`scene-compile:${name}`, { start: started, end: performance.now() });
      setFrameloop("demand");
      setPhase("ready");
      invalidate();
    };
    setFrameloop("never");
    gl.compileAsync(scene, camera).then(finish, finish);
    const timeout = window.setTimeout(finish, COMPILE_TIMEOUT_MS);
    return () => {
      done = true;
      window.clearTimeout(timeout);
    };
  }, [phase, gl, scene, camera, invalidate, setFrameloop, name]);

  return <group visible={phase !== "environment"}>{children}</group>;
}
