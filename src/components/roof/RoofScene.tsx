"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  BoxGeometry,
  DoubleSide,
  MathUtils,
  Matrix4,
  Object3D,
  PlaneGeometry,
  Quaternion,
  Shape,
  Vector3,
  type InstancedMesh,
  type Mesh,
  type PerspectiveCamera,
} from "three";
import { seededRandom } from "@/lib/random";
import { CompileGate } from "../three/CompileGate";
import type { LightformerSpec } from "../three/environment-builder";
import { PrefilteredEnvironment } from "../three/PrefilteredEnvironment";
import { ROOF_PHASES } from "./roof-phases";
import { endWallTexture, fibrocementTexture, longWallTexture, radialFade, solarTexture } from "./roof-textures";

// ── Mides de la nau (unitats ≈ metres a escala 1:2) ──
const W = 8; // llargada, al llarg del carener
const D = 5; // amplada
const H = 2.2; // alçada de les parets
const RISE = 1.25; // alçada del carener sobre les parets
const OVERHANG = 0.25;
const ROOF_W = W + 0.6;
const ANGLE = Math.atan2(RISE, D / 2);
const SLOPE_LEN = Math.hypot(D / 2, RISE) + OVERHANG;

const SHEET_COLS = 8;
const SHEET_ROWS = 3;
const SHEET_W = ROOF_W / SHEET_COLS;
const SHEET_L = SLOPE_LEN / SHEET_ROWS + 0.08;

const WALL_SEGMENTS = 3; // trams de paret llarga, un amb finestra cadascun
const FOV = 32;
const FIT_WIDTH = 12.5;

const PANEL_COLS = 5;
const PANEL_ROWS = 2;
const PANEL_W = 1.45;
const PANEL_L = 1.0;


export type RoofSceneState = { progress: RefObject<number>; reducedMotion: boolean };

const range = (p: number, [a, b]: readonly [number, number]) => MathUtils.clamp((p - a) / (b - a), 0, 1);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function easeOutBounce(t: number) {
  const n = 7.5625;
  const d = 2.75;
  if (t < 1 / d) return n * t * t;
  if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
  if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
  return n * (t -= 2.625 / d) * t + 0.984375;
}

/** Matriu del faldó: X al llarg del carener, Y pendent amunt, Z normal a la coberta. Origen al ràfec. */
function slopeMatrix(side: 1 | -1) {
  const origin = new Vector3(0, H - OVERHANG * Math.sin(ANGLE), D / 2 + OVERHANG * Math.cos(ANGLE));
  return new Matrix4()
    .makeRotationY(side === 1 ? 0 : Math.PI)
    .multiply(new Matrix4().makeTranslation(origin.x, origin.y, origin.z))
    .multiply(new Matrix4().makeRotationX(ANGLE - Math.PI / 2));
}

function corrugated(width: number, length: number, waves: number, depth: number) {
  const geometry = new PlaneGeometry(width, length, waves * 8, 1);
  const position = geometry.attributes.position!;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    position.setZ(i, depth * Math.sin(((x + width / 2) / width) * Math.PI * 2 * waves));
  }
  geometry.computeVertexNormals();
  return geometry;
}

function ribbed(width: number, length: number) {
  const geometry = new PlaneGeometry(width, length, 260, 1);
  geometry.translate(0, length / 2, 0);
  const position = geometry.attributes.position!;
  for (let i = 0; i < position.count; i++) {
    const phase = (position.getX(i) / 0.34) * Math.PI * 2;
    position.setZ(i, 0.045 * Math.pow(Math.max(0, Math.cos(phase)), 8));
  }
  geometry.computeVertexNormals();
  return geometry;
}

type Pose = { position: Vector3; quaternion: Quaternion; normal: Vector3 };

function pose(matrix: Matrix4): Pose {
  const position = new Vector3();
  const quaternion = new Quaternion();
  matrix.decompose(position, quaternion, new Vector3());
  return { position, quaternion, normal: new Vector3(0, 0, 1).applyQuaternion(quaternion) };
}

type Flight = { base: Pose; delay: number; duration: number; drift: Vector3; axis: Vector3; spin: number };

function useSheets() {
  return useMemo(() => {
    const random = seededRandom(2030);
    const flights: Flight[] = [];
    for (const side of [1, -1] as const) {
      const slope = slopeMatrix(side);
      for (let i = 0; i < SHEET_COLS; i++) {
        for (let j = 0; j < SHEET_ROWS; j++) {
          const local = new Matrix4().makeTranslation(-ROOF_W / 2 + (i + 0.5) * SHEET_W, (j + 0.5) * (SLOPE_LEN / SHEET_ROWS), 0.05 + j * 0.012);
          // Les plaques marxen d'esquerra a dreta, amb una mica de desordre.
          const order = side === 1 ? i : SHEET_COLS - 1 - i;
          flights.push({
            base: pose(slope.clone().multiply(local)),
            delay: (order / SHEET_COLS) * 0.72 + random() * 0.14 + (side === -1 ? 0.05 : 0),
            duration: 0.18 + random() * 0.08,
            drift: new Vector3((random() - 0.3) * 5, 0, side * (1.5 + random() * 3)),
            axis: new Vector3(random() - 0.5, random() - 0.5, random() - 0.5).normalize(),
            spin: 2 + random() * 5,
          });
        }
      }
    }
    return flights;
  }, []);
}

function usePanels() {
  return useMemo(() => {
    const random = seededRandom(7);
    const slope = slopeMatrix(1);
    const total = PANEL_COLS * PANEL_ROWS;
    return Array.from({ length: total }, (_, index) => {
      const i = index % PANEL_COLS;
      const j = Math.floor(index / PANEL_COLS);
      const u = (i - (PANEL_COLS - 1) / 2) * (PANEL_W + 0.08);
      const v = SLOPE_LEN * (j === 0 ? 0.33 : 0.7);
      return {
        base: pose(slope.clone().multiply(new Matrix4().makeTranslation(u, v, 0.16))),
        delay: (index / total) * 0.7 + random() * 0.12,
        wobble: (random() - 0.5) * 0.5,
      };
    });
  }, []);
}

const dummy = new Object3D();
const offset = new Vector3();
const X_AXIS = new Vector3(1, 0, 0);
const spinQuaternion = new Quaternion();

function Building({ progress, reducedMotion }: RoofSceneState) {
  const sheets = useSheets();
  const panels = usePanels();
  const sheetMesh = useRef<InstancedMesh>(null);
  const panelMesh = useRef<InstancedMesh>(null);
  const frontRoof = useRef<Mesh>(null);
  const backRoof = useRef<Mesh>(null);
  const smooth = useRef(reducedMotion ? 1 : (progress.current ?? 0));
  const { invalidate, camera, size } = useThree();

  const textures = useMemo(() => ({ longWall: longWallTexture(W / WALL_SEGMENTS, H), endWall: endWallTexture(D, H), fibro: fibrocementTexture(), solar: solarTexture(), groundFade: radialFade() }), []);
  const geometries = useMemo(() => {
    const gable = new Shape();
    gable.moveTo(-D / 2, 0);
    gable.lineTo(D / 2, 0);
    gable.lineTo(0, RISE);
    gable.closePath();
    return {
      sheet: corrugated(SHEET_W + 0.02, SHEET_L, 5, 0.03),
      roof: ribbed(ROOF_W, SLOPE_LEN),
      panel: new BoxGeometry(PANEL_W, PANEL_L, 0.05),
      gable,
    };
  }, []);
  useEffect(() => () => Object.values(textures).forEach((texture) => texture.dispose()), [textures]);

  useEffect(() => {
    textures.longWall.repeat.set(WALL_SEGMENTS, 1);
    const onScroll = () => invalidate();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [invalidate, textures]);

  // Escriptori: la nau a la dreta del text. Mòbil: sota el text. Es fa desplaçant el frustum.
  useLayoutEffect(() => {
    const perspective = camera as PerspectiveCamera;
    const wide = size.width / size.height > 1.1;
    perspective.setViewOffset(size.width, size.height, wide ? -size.width * 0.18 : 0, wide ? 0 : -size.height * 0.14, size.width, size.height);
    perspective.updateProjectionMatrix();
    invalidate();
  }, [camera, size, invalidate]);

  const slopes = useMemo(() => [slopeMatrix(1), slopeMatrix(-1)], []);

  useFrame((_, rawDelta) => {
    const target = reducedMotion ? 1 : (progress.current ?? 0);
    smooth.current = MathUtils.damp(smooth.current, target, 5, Math.min(rawDelta, 1 / 30));
    if (Math.abs(smooth.current - target) < 0.0005) smooth.current = target;
    else invalidate();
    const p = smooth.current;

    // Càmera: gira lleugerament cap al frontal a mesura que avança l'obra.
    // Distància perquè hi càpiga la nau (≈12 unitats d'ample) també en pantalles estretes.
    const aspect = size.width / size.height;
    const radius = Math.max(15.5, FIT_WIDTH / 2 / (Math.tan(MathUtils.degToRad(FOV / 2)) * Math.min(aspect, 1.4)));
    const azimuth = MathUtils.lerp(0.85, 0.3, easeInOut(p));
    const elevation = MathUtils.lerp(0.55, 0.42, p);
    camera.position.set(Math.sin(azimuth) * Math.cos(elevation) * radius, 1.6 + Math.sin(elevation) * radius, Math.cos(azimuth) * Math.cos(elevation) * radius);
    camera.lookAt(0, 1.9, 0);

    // 1. Les plaques d'uralita s'enlairen i marxen per dalt.
    const removal = range(p, ROOF_PHASES.removal);
    const sheetMeshCurrent = sheetMesh.current;
    if (sheetMeshCurrent) {
      sheets.forEach((sheet, index) => {
        const t = MathUtils.clamp((removal - sheet.delay) / sheet.duration, 0, 1);
        if (t >= 1) {
          dummy.scale.setScalar(0);
        } else {
          offset.set(sheet.drift.x * t, 10 * t * t + 1.5 * t, sheet.drift.z * t);
          dummy.position.copy(sheet.base.position).addScaledVector(sheet.base.normal, t * 0.8).add(offset);
          spinQuaternion.setFromAxisAngle(sheet.axis, sheet.spin * t * t);
          dummy.quaternion.copy(sheet.base.quaternion).premultiply(spinQuaternion);
          dummy.scale.setScalar(1);
        }
        dummy.updateMatrix();
        sheetMeshCurrent.setMatrixAt(index, dummy.matrix);
      });
      sheetMeshCurrent.instanceMatrix.needsUpdate = true;
    }

    // 2. La coberta nova de panell sandvitx es desplega del ràfec al carener.
    const reveal = easeInOut(range(p, ROOF_PHASES.newRoof));
    for (const mesh of [frontRoof.current, backRoof.current]) {
      if (!mesh) continue;
      mesh.visible = reveal > 0.001;
      mesh.scale.set(1, Math.max(reveal, 0.001), 1);
    }

    // 3. Les plaques solars cauen del cel i reboten en assentar-se.
    const solar = range(p, ROOF_PHASES.solar);
    const panelMeshCurrent = panelMesh.current;
    if (panelMeshCurrent) {
      panels.forEach((panel, index) => {
        const t = MathUtils.clamp((solar - panel.delay) / 0.3, 0, 1);
        if (t <= 0) {
          dummy.scale.setScalar(0);
        } else {
          const fall = 1 - easeOutBounce(t);
          dummy.position.copy(panel.base.position);
          dummy.position.y += fall * 7;
          spinQuaternion.setFromAxisAngle(X_AXIS, panel.wobble * fall);
          dummy.quaternion.copy(panel.base.quaternion).multiply(spinQuaternion);
          dummy.scale.setScalar(1);
        }
        dummy.updateMatrix();
        panelMeshCurrent.setMatrixAt(index, dummy.matrix);
      });
      panelMeshCurrent.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Terra */}
      {/* Terra: s'esvaeix cap als costats perquè no hi hagi una línia d'horitzó dura */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[13, 48]} />
        <meshStandardMaterial color="#d6ccb8" roughness={1} alphaMap={textures.groundFade} transparent depthWrite={false} />
      </mesh>

      {/* Parets i timpans */}
      {/* Ordre de cares de la caixa: +x, -x, +y, -y, +z, -z. La de dalt és l'interior de la nau,
          que es veu quan marxen les plaques: fosca i sense maó. */}
      <mesh position={[0, H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial attach="material-0" map={textures.endWall} roughness={0.95} />
        <meshStandardMaterial attach="material-1" map={textures.endWall} roughness={0.95} />
        <meshStandardMaterial attach="material-2" color="#3a3f43" roughness={1} />
        <meshStandardMaterial attach="material-3" color="#3a3f43" roughness={1} />
        <meshStandardMaterial attach="material-4" map={textures.longWall} roughness={0.95} />
        <meshStandardMaterial attach="material-5" map={textures.longWall} roughness={0.95} />
      </mesh>
      {[1, -1].map((side) => (
        <mesh key={side} position={[(side * W) / 2, H, 0]} rotation-y={(side * Math.PI) / 2} castShadow>
          <shapeGeometry args={[geometries.gable]} />
          <meshStandardMaterial color="#9c5941" roughness={0.95} />
        </mesh>
      ))}

      {/* Estructura: corretges i encavallades, que es veuen quan marxen les plaques */}
      {slopes.map((slope, s) => (
        <group key={s} matrixAutoUpdate={false} matrix={slope}>
          {[0.12, 0.38, 0.63, 0.9].map((v) => (
            <mesh key={v} position={[0, v * SLOPE_LEN, -0.04]} castShadow>
              <boxGeometry args={[ROOF_W, 0.07, 0.08]} />
              <meshStandardMaterial color="#4b5359" metalness={0.5} roughness={0.5} />
            </mesh>
          ))}
          {[-3.9, -2.6, -1.3, 0, 1.3, 2.6, 3.9].map((x) => (
            <mesh key={x} position={[x, SLOPE_LEN / 2, -0.13]}>
              <boxGeometry args={[0.08, SLOPE_LEN, 0.1]} />
              <meshStandardMaterial color="#3d4449" metalness={0.5} roughness={0.5} />
            </mesh>
          ))}
          {/* Coberta nova: creix des del ràfec */}
          <mesh ref={s === 0 ? frontRoof : backRoof} position={[0, 0, 0.03]} castShadow receiveShadow visible={false}>
            <primitive object={geometries.roof} attach="geometry" />
            <meshStandardMaterial color="#dfe4e6" metalness={0.35} roughness={0.42} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, H + RISE + 0.02, 0]}>
        <boxGeometry args={[ROOF_W, 0.1, 0.18]} />
        <meshStandardMaterial color="#9aa3a8" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Plaques d'uralita i plaques solars: instàncies, un sol draw call per tipus */}
      <instancedMesh ref={sheetMesh} args={[geometries.sheet, undefined, sheets.length]} castShadow receiveShadow>
        <meshStandardMaterial map={textures.fibro} roughness={0.95} side={DoubleSide} />
      </instancedMesh>
      <instancedMesh ref={panelMesh} args={[geometries.panel, undefined, panels.length]} castShadow>
        <meshPhysicalMaterial map={textures.solar} roughness={0.22} metalness={0.2} clearcoat={1} clearcoatRoughness={0.08} />
      </instancedMesh>
    </group>
  );
}

// Llums d'estudi per als reflexos. Constant de mòdul: la referència ha de ser estable.
const SKY_LIGHTS: LightformerSpec[] = [
  { intensity: 2, position: [0, 8, 4], scale: [14, 6, 1] },
  { intensity: 1.2, position: [-8, 3, 2], scale: [10, 3, 1] },
];

export default function RoofScene({ progress, reducedMotion }: RoofSceneState) {
  const [dpr, setDpr] = useState(1.5);
  return (
    <Canvas
      frameloop="demand"
      dpr={dpr}
      shadows
      camera={{ position: [10, 8, 12], fov: FOV, far: 200 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      resize={{ scroll: false, debounce: { scroll: 0, resize: 150 } }}
      aria-hidden="true"
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} flipflops={3} onFallback={() => setDpr(1)} />
      <hemisphereLight args={["#e3f1ff", "#b8a684", 1.2]} />
      <directionalLight
        position={[7, 12, 6]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0006}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
      />
      <PrefilteredEnvironment lights={SKY_LIGHTS} resolution={64} />
      {/* Compila els shaders en segon pla i no pinta fins que estan a punt: el primer pintat no bloqueja. */}
      <CompileGate name="roof">
        <Building progress={progress} reducedMotion={reducedMotion} />
      </CompileGate>
    </Canvas>
  );
}
