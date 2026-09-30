"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { CatmullRomCurve3, DoubleSide, MathUtils, Vector2, Vector3, type CanvasTexture, type Group } from "three";
import { createLabelTexture, LABEL_HEIGHT, LABEL_RADIUS } from "./label-texture";

const R = 0.62;
const BOTTLE_HEIGHT = 5; // del cul de l'ampolla fins a dalt del cordó
const LABEL_BOTTOM = 0.3;

export type SceneState = {
  /** Progrés del scroll dins la secció, de 0 a 1. */
  progress: RefObject<number>;
  /** Es crida a cada fotograma amb el grau d'«aterratge» (0-1) per sincronitzar l'HTML. */
  onSettle?: (settle: number) => void;
  reducedMotion: boolean;
  active: boolean;
};

function useBottleGeometry() {
  return useMemo(() => {
    const body: Vector2[] = [new Vector2(0, 0)];
    const corner = 0.14;
    for (let i = 0; i <= 10; i++) {
      const a = -Math.PI / 2 + (i / 10) * (Math.PI / 2);
      body.push(new Vector2(R - corner + corner * Math.cos(a), corner + corner * Math.sin(a)));
    }
    body.push(new Vector2(R, 3.05));
    for (let i = 1; i <= 14; i++) {
      const t = i / 14;
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

function Bottle({ label, groupRef, mirrorStrap = false }: { label: CanvasTexture | null; groupRef: RefObject<Group | null>; mirrorStrap?: boolean }) {
  const { body, cap, strap } = useBottleGeometry();
  return (
    <group ref={groupRef}>
      <group position={[0, -BOTTLE_HEIGHT / 2, 0]}>
        {/* Vidre */}
        <mesh castShadow>
          <latheGeometry args={[body, 128]} />
          <meshPhysicalMaterial
            transmission={1}
            thickness={0.2}
            roughness={0}
            ior={1.45}
            color="#ffffff"
            clearcoat={1}
            clearcoatRoughness={0.05}
            envMapIntensity={1.4}
            side={DoubleSide}
          />
        </mesh>
        {/* Cul gruixut de vidre */}
        <mesh position={[0, 0.09, 0]}>
          <cylinderGeometry args={[R - 0.05, R - 0.08, 0.16, 96]} />
          <meshPhysicalMaterial transmission={1} thickness={0.6} roughness={0.08} ior={1.5} color="#eef5f6" envMapIntensity={1.2} />
        </mesh>
        {/* Rosca del coll, que es veu a través del vidre */}
        <mesh position={[0, 3.5, 0]}>
          <cylinderGeometry args={[0.49, 0.49, 0.12, 64]} />
          <meshStandardMaterial color="#39424a" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Tap d'acer */}
        <mesh castShadow>
          <latheGeometry args={[cap, 96]} />
          <meshStandardMaterial color="#c3c8cc" metalness={1} roughness={0.26} envMapIntensity={1.3} />
        </mesh>
        {/* Cordó: a l ampolla girada (posterior) el reflectim perquè totes dues el tinguin a la dreta, com a la proposta. */}
        <mesh castShadow rotation-y={mirrorStrap ? Math.PI : 0}>
          <tubeGeometry args={[strap, 160, 0.05, 14, true]} />
          <meshStandardMaterial color="#ff6a1a" roughness={0.85} />
        </mesh>
        {/* Impressió: frontal i posterior en una sola textura */}
        {label && (
          <mesh position={[0, LABEL_BOTTOM + LABEL_HEIGHT / 2, 0]} renderOrder={2}>
            <cylinderGeometry args={[LABEL_RADIUS, LABEL_RADIUS, LABEL_HEIGHT, 192, 1, true, -Math.PI / 2, Math.PI * 2]} />
            <meshBasicMaterial map={label} transparent depthWrite={false} toneMapped={false} />
          </mesh>
        )}
      </group>
    </group>
  );
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function Bottles({ progress, onSettle, reducedMotion }: Omit<SceneState, "active">) {
  const left = useRef<Group>(null);
  const right = useRef<Group>(null);
  const smooth = useRef(reducedMotion ? 1 : 0);
  const [label, setLabel] = useState<CanvasTexture | null>(null);
  const { viewport } = useThree();

  useEffect(() => {
    let texture: CanvasTexture | undefined;
    let cancelled = false;
    createLabelTexture()
      .then((created) => {
        if (cancelled) return created.dispose();
        texture = created;
        setLabel(created);
      })
      .catch((error) => console.error("[ampolla] no s'ha pogut dibuixar l'etiqueta", error));
    return () => {
      cancelled = true;
      texture?.dispose();
    };
  }, []);

  // Escriptori: ampolles a la columna dreta. Mòbil: sota el text, més petites.
  const wide = viewport.aspect > 1.1;
  const scale = wide ? Math.min(1, viewport.height / 6.6) : Math.min(0.74, viewport.width / 3.6);
  const centerX = wide ? viewport.width * 0.2 : 0;
  const centerY = wide ? -0.15 : -viewport.height * 0.17;
  const spread = (wide ? 0.78 : 0.7) * scale * 1.9;
  const floorY = centerY - (BOTTLE_HEIGHT / 2) * scale;

  useFrame((state, delta) => {
    const target = reducedMotion ? 1 : (progress.current ?? 0);
    smooth.current = MathUtils.damp(smooth.current, target, 4.5, delta);
    const p = smooth.current;
    const enter = easeOutCubic(MathUtils.clamp(p / 0.7, 0, 1));
    const settle = MathUtils.clamp((p - 0.6) / 0.15, 0, 1);
    const time = state.clock.elapsedTime;
    const idle = reducedMotion ? 0 : settle;
    const offscreen = viewport.width * 0.5 + 1.5;
    const turns = Math.PI * 3;

    for (const [ref, side] of [[left, -1], [right, 1]] as const) {
      const group = ref.current;
      if (!group) continue;
      const restX = centerX + side * spread;
      group.position.x = MathUtils.lerp(side * offscreen + centerX, restX, enter);
      group.position.y = MathUtils.lerp(centerY - 1.4, centerY, enter) + Math.sin(time * 1.1 + side) * 0.035 * idle;
      group.position.z = MathUtils.lerp(-1.5, 0, enter);
      const restRotation = side < 0 ? 0 : Math.PI;
      group.rotation.y = restRotation - side * turns * (1 - enter) + Math.sin(time * 0.6 + side) * 0.1 * idle;
      group.rotation.z = -side * 0.55 * (1 - enter);
      group.rotation.x = 0.25 * (1 - enter);
      group.scale.setScalar(scale);
    }
    onSettle?.(settle);
  });

  return (
    <>
      <Bottle label={label} groupRef={left} />
      <Bottle label={label} groupRef={right} mirrorStrap />
      <ContactShadows position={[centerX, floorY - 0.01, 0]} scale={wide ? 9 : 5} opacity={0.35} blur={2.6} far={3} resolution={512} color="#1b262e" />
    </>
  );
}

export default function BottleScene({ progress, onSettle, reducedMotion, active }: SceneState) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 13], fov: 32 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      flat
      aria-hidden="true"
    >
      <color attach="background" args={["#eef2f3"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 6]} intensity={1.6} />
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={2.4} position={[0, 5, -8]} scale={[12, 6, 1]} />
        <Lightformer intensity={3} rotation-y={Math.PI / 2} position={[-6, 1, 0]} scale={[14, 0.6, 1]} />
        <Lightformer intensity={3} rotation-y={-Math.PI / 2} position={[6, 1, 0]} scale={[14, 0.6, 1]} />
        <Lightformer intensity={1.6} rotation-y={Math.PI / 2} position={[-6, -1.5, 2]} scale={[14, 0.4, 1]} />
        <Lightformer form="ring" intensity={2} position={[3, 3, 6]} scale={2.5} />
      </Environment>
      <Bottles progress={progress} onSettle={onSettle} reducedMotion={reducedMotion} />
    </Canvas>
  );
}
