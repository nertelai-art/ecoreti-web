"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { CanvasTexture, CatmullRomCurve3, MathUtils, Vector2, Vector3, type Group, type Mesh, type MeshBasicMaterial } from "three";
import { CompileGate } from "../three/CompileGate";
import type { LightformerSpec } from "../three/environment-builder";
import { PrefilteredEnvironment } from "../three/PrefilteredEnvironment";
import { createLabelTexture, LABEL_HEIGHT, LABEL_RADIUS } from "./label-texture";

const R = 0.62;
const BOTTLE_HEIGHT = 5; // del cul de l'ampolla fins a dalt del cordó
const LABEL_BOTTOM = 0.3;

export type SceneState = {
  /** Progrés del scroll dins la secció, de 0 a 1. */
  progress: RefObject<number>;
  reducedMotion: boolean;
};

function useBottleGeometry() {
  return useMemo(() => {
    const body: Vector2[] = [new Vector2(0, 0)];
    const corner = 0.14;
    for (let i = 0; i <= 8; i++) {
      const a = -Math.PI / 2 + (i / 8) * (Math.PI / 2);
      body.push(new Vector2(R - corner + corner * Math.cos(a), corner + corner * Math.sin(a)));
    }
    body.push(new Vector2(R, 3.05));
    for (let i = 1; i <= 12; i++) {
      const t = i / 12;
      const eased = t * t * (3 - 2 * t);
      body.push(new Vector2(R - (R - 0.5) * eased, 3.05 + 0.42 * t));
    }
    body.push(new Vector2(0.5, 3.62));

    const cap = [
      new Vector2(0, 3.55),
      new Vector2(0.52, 3.55),
      new Vector2(0.545, 3.58),
      new Vector2(0.545, 4.1),
      new Vector2(0.52, 4.15),
      new Vector2(0, 4.15),
    ];

    const strap = new CatmullRomCurve3(
      [
        new Vector3(0.26, 4.13, 0),
        new Vector3(0.4, 4.45, 0.02),
        new Vector3(0.6, 4.82, 0.03),
        new Vector3(0.82, 5.0, 0.02),
        new Vector3(0.99, 4.9, 0),
        new Vector3(0.93, 4.66, -0.02),
        new Vector3(0.68, 4.3, -0.03),
        new Vector3(0.46, 4.1, -0.02),
      ],
      true,
      "centripetal",
    );
    return { body, cap, strap };
  }, []);
}

/** Ombra difusa pintada un sol cop: substitueix ContactShadows, que re-renderitzava l'escena cada fotograma. */
function useShadowTexture() {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "rgba(27,38,46,0.55)");
    gradient.addColorStop(0.5, "rgba(27,38,46,0.18)");
    gradient.addColorStop(1, "rgba(27,38,46,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    return new CanvasTexture(canvas);
  }, []);
}

function Bottle({ label, groupRef, mirrorStrap = false }: { label: CanvasTexture; groupRef: RefObject<Group | null>; mirrorStrap?: boolean }) {
  const { body, cap, strap } = useBottleGeometry();
  return (
    <group ref={groupRef}>
      <group position={[0, -BOTTLE_HEIGHT / 2, 0]}>
        {/* Vidre. Una sola cara: la doble cara afegeix una passada de transmissió sencera. */}
        <mesh>
          <latheGeometry args={[body, 72]} />
          <meshPhysicalMaterial transmission={1} thickness={0.2} roughness={0} ior={1.45} color="#ffffff" clearcoat={1} clearcoatRoughness={0.05} envMapIntensity={1.4} />
        </mesh>
        {/* Cul gruixut de vidre */}
        <mesh position={[0, 0.09, 0]}>
          <cylinderGeometry args={[R - 0.05, R - 0.08, 0.16, 48]} />
          <meshPhysicalMaterial transmission={1} thickness={0.6} roughness={0.08} ior={1.5} color="#eef5f6" envMapIntensity={1.2} />
        </mesh>
        {/* Rosca del coll, que es veu a través del vidre */}
        <mesh position={[0, 3.5, 0]}>
          <cylinderGeometry args={[0.49, 0.49, 0.12, 48]} />
          <meshStandardMaterial color="#39424a" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Tap d'acer */}
        <mesh>
          <latheGeometry args={[cap, 64]} />
          <meshStandardMaterial color="#c3c8cc" metalness={1} roughness={0.26} envMapIntensity={1.3} />
        </mesh>
        {/* Cordó: a l'ampolla girada el reflectim perquè totes dues el tinguin a la dreta, com a la proposta. */}
        <mesh rotation-y={mirrorStrap ? Math.PI : 0}>
          <tubeGeometry args={[strap, 96, 0.05, 10, true]} />
          <meshStandardMaterial color="#ff6a1a" roughness={0.85} />
        </mesh>
        {/* Impressió: frontal i posterior en una sola textura */}
        <mesh position={[0, LABEL_BOTTOM + LABEL_HEIGHT / 2, 0]} renderOrder={2}>
          <cylinderGeometry args={[LABEL_RADIUS, LABEL_RADIUS, LABEL_HEIGHT, 128, 1, true, -Math.PI / 2, Math.PI * 2]} />
          <meshBasicMaterial map={label} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function BlobShadow({ meshRef, texture, scale }: { meshRef: RefObject<Mesh | null>; texture: CanvasTexture; scale: number }) {
  return (
    <mesh ref={meshRef} rotation-x={-Math.PI / 2} scale={[2.4 * scale, 1.1 * scale, 1]}>
      <planeGeometry />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} opacity={0} />
    </mesh>
  );
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const SMOOTHING = 5;
// Un salt de temps gran (pestanya en segon pla, pausa del navegador) no ha de fer saltar l'animació.
const MAX_DELTA = 1 / 30;

function Bottles({ progress, reducedMotion }: SceneState) {
  const left = useRef<Group>(null);
  const right = useRef<Group>(null);
  const leftShadow = useRef<Mesh>(null);
  const rightShadow = useRef<Mesh>(null);
  const smooth = useRef(reducedMotion ? 1 : (progress.current ?? 0));
  const { viewport, invalidate } = useThree();
  const shadowTexture = useShadowTexture();
  const [label] = useState(createLabelTexture);

  useEffect(() => {
    label.ready.then(() => invalidate()).catch((error) => console.error("[ampolla] etiqueta:", error instanceof Error ? error.message : error));
    return () => label.texture.dispose();
  }, [label, invalidate]);

  // Només pintem quan hi ha scroll o l'animació encara s'està assentant: en repòs, la GPU no treballa.
  useEffect(() => {
    const onScroll = () => invalidate();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [invalidate]);

  // Escriptori: ampolles a la columna dreta. Mòbil: sota el text, més petites.
  const wide = viewport.aspect > 1.1;
  const scale = wide ? Math.min(1, viewport.height / 6.6) : Math.min(0.74, viewport.width / 3.6);
  const centerX = wide ? viewport.width * 0.2 : 0;
  const centerY = wide ? -0.15 : -viewport.height * 0.17;
  const spread = (wide ? 0.78 : 0.7) * scale * 1.9;
  const floorY = centerY - (BOTTLE_HEIGHT / 2) * scale;

  useFrame((_, rawDelta) => {
    const target = reducedMotion ? 1 : (progress.current ?? 0);
    const delta = Math.min(rawDelta, MAX_DELTA);
    smooth.current = MathUtils.damp(smooth.current, target, SMOOTHING, delta);
    if (Math.abs(smooth.current - target) < 0.0005) smooth.current = target;
    else invalidate();

    const enter = easeOutCubic(MathUtils.clamp(smooth.current / 0.7, 0, 1));
    const offscreen = viewport.width * 0.5 + 1.5;
    const turns = Math.PI * 3;

    ([[left, leftShadow, -1], [right, rightShadow, 1]] as const).forEach(([ref, shadowRef, side]) => {
      const group = ref.current;
      if (!group) return;
      const x = MathUtils.lerp(side * offscreen + centerX, centerX + side * spread, enter);
      group.position.set(x, MathUtils.lerp(centerY - 1.4, centerY, enter), MathUtils.lerp(-1.5, 0, enter));
      group.rotation.set(0.25 * (1 - enter), (side < 0 ? 0 : Math.PI) - side * turns * (1 - enter), -side * 0.55 * (1 - enter));
      group.scale.setScalar(scale);

      const shadow = shadowRef.current;
      if (shadow) {
        shadow.position.set(x, floorY + 0.01, 0);
        (shadow.material as MeshBasicMaterial).opacity = enter;
      }
    });
  });

  return (
    <>
      <Bottle label={label.texture} groupRef={left} />
      <Bottle label={label.texture} groupRef={right} mirrorStrap />
      <BlobShadow meshRef={leftShadow} texture={shadowTexture} scale={scale} />
      <BlobShadow meshRef={rightShadow} texture={shadowTexture} scale={scale} />
    </>
  );
}

// Llums d'estudi per als reflexos. Constant de mòdul: la referència ha de ser estable.
const STUDIO_LIGHTS: LightformerSpec[] = [
  { intensity: 2.4, position: [0, 5, -8], scale: [12, 6, 1] },
  { intensity: 3, position: [-6, 1, 0], scale: [14, 0.6, 1] },
  { intensity: 3, position: [6, 1, 0], scale: [14, 0.6, 1] },
  { intensity: 1.6, position: [-6, -1.5, 2], scale: [14, 0.4, 1] },
  { form: "ring", intensity: 2, position: [3, 3, 6], scale: 2.5 },
];

export default function BottleScene({ progress, reducedMotion }: SceneState) {
  const [dpr, setDpr] = useState(1.5);
  return (
    <Canvas
      frameloop="demand"
      dpr={dpr}
      camera={{ position: [0, 0, 13], fov: 32 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      // La transmissió del vidre a mitja resolució: no es nota i estalvia molta GPU.
      onCreated={({ gl }) => {
        gl.transmissionResolutionScale = 0.5;
      }}
      // No escoltem el scroll per recalcular la mida (a mòbil, la barra d'adreces la canvia contínuament).
      resize={{ scroll: false, debounce: { scroll: 0, resize: 150 } }}
      flat
      aria-hidden="true"
    >
      {/* Si el dispositiu no arriba, baixem la resolució en lloc de perdre fotogrames. */}
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} flipflops={3} onFallback={() => setDpr(1)} />
      <color attach="background" args={["#eef2f3"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 6]} intensity={1.6} />
      <PrefilteredEnvironment lights={STUDIO_LIGHTS} resolution={128} />
      {/* Compila els shaders en segon pla i no pinta fins que estan a punt: el primer pintat no bloqueja. */}
      <CompileGate name="bottle">
        <Bottles progress={progress} reducedMotion={reducedMotion} />
      </CompileGate>
    </Canvas>
  );
}
