import {
  CubeCamera,
  DoubleSide,
  HalfFloatType,
  Mesh,
  MeshBasicMaterial,
  PMREMGenerator,
  PlaneGeometry,
  RingGeometry,
  Scene,
  WebGLCubeRenderTarget,
  type WebGLRenderTarget,
  type WebGLRenderer,
} from "three";

/** Un llum d'estudi: un pla o un anell blanc que només existeix per reflectir-se als materials. */
export type LightformerSpec = {
  form?: "rect" | "ring";
  intensity: number;
  position: [number, number, number];
  scale: number | [number, number, number];
};

export type PrefilteredEnvironment = { data: Uint16Array; width: number; height: number };

/**
 * Genera el mapa d'entorn prefiltrat (PMREM) a partir d'uns llums d'estudi.
 *
 * Reprodueix el que feien `<Environment>` + `<Lightformer>` de drei (malla blanca de doble cara
 * multiplicada per la intensitat i encarada a l'origen, càmera cúbica a l'origen) i el prefiltrat
 * que three.js fa pel seu compte. És el pas car: compila uns shaders molt pesants i s'hi espera de
 * manera síncrona. Qui el crida n'ha d'alliberar el resultat amb `dispose()`.
 */
export function renderPrefilteredEnvironment(renderer: WebGLRenderer, lights: LightformerSpec[], resolution: number): WebGLRenderTarget {
  const scene = new Scene();
  const disposables: { dispose(): void }[] = [];
  for (const light of lights) {
    const geometry = light.form === "ring" ? new RingGeometry(0.25, 0.5, 64) : new PlaneGeometry(1, 1);
    const material = new MeshBasicMaterial({ toneMapped: false, side: DoubleSide });
    material.color.multiplyScalar(light.intensity);
    const mesh = new Mesh(geometry, material);
    mesh.position.set(...light.position);
    if (typeof light.scale === "number") mesh.scale.setScalar(light.scale);
    else mesh.scale.set(...light.scale);
    mesh.lookAt(0, 0, 0);
    scene.add(mesh);
    disposables.push(geometry, material);
  }

  const cube = new WebGLCubeRenderTarget(resolution);
  cube.texture.type = HalfFloatType;
  new CubeCamera(0.1, 1000, cube).update(renderer, scene);

  const pmrem = new PMREMGenerator(renderer);
  const target = pmrem.fromCubemap(cube.texture);
  pmrem.dispose();
  cube.dispose();
  disposables.forEach((item) => item.dispose());
  return target;
}

/**
 * El mateix, però retornant els píxels per poder-los enviar d'un worker al fil principal.
 * Retorna `null` si la targeta gràfica no deixa llegir textures de coma flotant (tot zeros).
 */
export function readPrefilteredEnvironment(renderer: WebGLRenderer, lights: LightformerSpec[], resolution: number): PrefilteredEnvironment | null {
  const target = renderPrefilteredEnvironment(renderer, lights, resolution);
  const data = new Uint16Array(target.width * target.height * 4);
  renderer.readRenderTargetPixels(target, 0, 0, target.width, target.height, data);
  const result = { data, width: target.width, height: target.height };
  target.dispose();
  return data.some((value) => value !== 0) ? result : null;
}
