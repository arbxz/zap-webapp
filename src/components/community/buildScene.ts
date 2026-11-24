import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import {
  FLOOR_HEIGHT,
  type House,
  type ScreenPoint,
  geoToScene,
  ndcToScreen,
} from "./houses";
import { MAURITIUS_OUTLINE } from "./mauritius";
import type { PowerStatus } from "./power";
import { buildPowerGrid } from "./powerLines";

// three.js takes plain colours, not CSS variables. INK mirrors the token in
// globals.css.
const INK = "#040202";
const WALL = "#ffffff";
const ROOF = "#f1f1f3";

// The island stays light grey in both themes; on the dark page it drops a
// shade so it doesn't glare next to the white houses.
const LAND = { light: "#e2e2e6", dark: "#cfcfd4" };
/**
 * The coast slopes down over a rounded bevel instead of a sheer wall.
 * COAST_SLOPE is the bevel's height, COAST_WIDTH how far it reaches out.
 */
const COAST_SLOPE = 0.35;
const COAST_WIDTH = 0.5;
/** Height of the island's flat top; houses stand on it. */
const LAND_HEIGHT = COAST_SLOPE;
/** Where the grid pylon stands: inland, between the houses. */
const GRID_HUB = { lat: -20.25, lng: 57.61 };
const GABLE_HEIGHT = 0.7;
const FLAT_ROOF_HEIGHT = 0.15;

export interface CommunitySceneOptions {
  houses: House[];
  dark: boolean;
  autoRotate: boolean;
  /** Whether the power pulses move; off for reduced motion. */
  powerMotion: boolean;
  /** Called after each rendered frame with where each house's label goes. */
  onFrame: (points: ScreenPoint[]) => void;
}

export interface CommunityScene {
  setDark: (dark: boolean) => void;
  setAutoRotate: (on: boolean) => void;
  setPowerMotion: (on: boolean) => void;
  /** Power status for each house, in the same order as `houses`. */
  setPower: (statuses: PowerStatus[]) => void;
  /** Turn the camera round the island; positive is to the left. */
  turn: (radians: number) => void;
  /** Pause rendering while the scene is off screen. */
  setRunning: (running: boolean) => void;
  dispose: () => void;
}

/** thresholdAngle: faces meeting at a softer angle than this get no line. */
function withEdges(mesh: THREE.Mesh, thresholdAngle = 1): THREE.Group {
  const group = new THREE.Group();
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry, thresholdAngle),
    new THREE.LineBasicMaterial({ color: INK }),
  );
  group.add(mesh, edges);
  return group;
}

function buildHouse(house: House): THREE.Group {
  const group = new THREE.Group();
  const { width: w, depth: d } = house;
  const h = house.floors * FLOOR_HEIGHT;

  const wallMat = new THREE.MeshStandardMaterial({
    color: WALL,
    roughness: 0.9,
  });
  const walls = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
  walls.position.y = h / 2;
  walls.castShadow = true;
  walls.receiveShadow = true;
  group.add(withEdges(walls));

  const roofMat = new THREE.MeshStandardMaterial({
    color: ROOF,
    roughness: 0.8,
  });
  if (house.roof === "gable") {
    const overhang = 0.15;
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2 - overhang, 0);
    shape.lineTo(w / 2 + overhang, 0);
    shape.lineTo(0, GABLE_HEIGHT);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: d + overhang * 2,
      bevelEnabled: false,
    });
    geo.translate(0, 0, -(d + overhang * 2) / 2);
    const roof = new THREE.Mesh(geo, roofMat);
    roof.position.y = h;
    roof.castShadow = true;
    group.add(withEdges(roof));
  } else {
    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.2, FLAT_ROOF_HEIGHT, d + 0.2),
      roofMat,
    );
    slab.position.y = h + FLAT_ROOF_HEIGHT / 2;
    slab.castShadow = true;
    group.add(withEdges(slab));
  }

  const { x, z } = geoToScene(house.lng, house.lat);
  group.position.set(x, LAND_HEIGHT, z);
  return group;
}

function buildIsland(material: THREE.Material): THREE.Group {
  // The shape is drawn in x/y and laid flat below, which sends shape y to
  // scene -z, so y is the negated scene z.
  const shape = new THREE.Shape(
    MAURITIUS_OUTLINE.map(([lng, lat]) => {
      const { x, z } = geoToScene(lng, lat);
      return new THREE.Vector2(x, -z);
    }),
  );
  const geometry = new THREE.ExtrudeGeometry(shape, {
    // The extrusion itself is a sliver: the bevel makes the height, rising
    // from the waterline (y = 0) to the flat top in four rounded steps. The
    // matching bevel underneath sits below the waterline, out of sight.
    depth: 0.001,
    bevelEnabled: true,
    bevelThickness: COAST_SLOPE,
    bevelSize: COAST_WIDTH,
    bevelOffset: -COAST_WIDTH,
    bevelSegments: 4,
  });
  const land = new THREE.Mesh(geometry, material);
  land.receiveShadow = true;
  // Rotate the group, not the mesh, so the coastline outline lies flat too.
  // 25 degrees hides the lines between bevel steps (22.5 degrees apart),
  // so the coast reads as one smooth slope.
  const island = withEdges(land, 25);
  island.rotation.x = -Math.PI / 2;
  return island;
}

export function createCommunityScene(
  container: HTMLElement,
  options: CommunitySceneOptions,
): CommunityScene {
  // failIfMajorPerformanceCaveat refuses software WebGL (SwiftShader,
  // llvmpipe), where the animation loop runs on the CPU and freezes the
  // page for seconds. The constructor then throws, and the component shows
  // the houses as a plain list instead.
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    failIfMajorPerformanceCaveat: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);

  const canvas = renderer.domElement;
  canvas.setAttribute("role", "img");
  canvas.setAttribute(
    "aria-label",
    `A map of Mauritius with ${options.houses.length} white houses on it: ${options.houses.map((h) => h.locality).join(", ")}. A power line runs from a pylon to each house. Drag sideways to turn the view.`,
  );
  canvas.className = "block size-full";
  // Vertical swipes still scroll the page on touch screens; sideways drags turn the view.
  canvas.style.touchAction = "pan-y";
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 300);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 0, 0);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.autoRotateSpeed = 0.5;
  controls.autoRotate = options.autoRotate;
  // Landscape screens get a tilted view from the south. Portrait screens
  // look down from nearly overhead, which spreads the houses (and their
  // labels) further apart up and down the screen.
  const portrait = container.clientWidth < container.clientHeight;
  const polar = portrait ? 0.4 : 0.8;
  camera.position
    .setFromSpherical(new THREE.Spherical(42, polar, 0))
    .add(controls.target);
  // Turn around the street only; the tilt stays put.
  controls.minPolarAngle = polar;
  controls.maxPolarAngle = polar;
  controls.update();

  scene.add(new THREE.HemisphereLight("#ffffff", "#bdbdc6", 1.5));
  const sun = new THREE.DirectionalLight("#ffffff", 1.4);
  sun.position.set(15, 30, 20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, {
    left: -18,
    right: 18,
    top: 18,
    bottom: -18,
    far: 80,
  });
  sun.shadow.camera.updateProjectionMatrix();
  // Without a normal bias the flat island shades itself in a fine pattern
  // ("shadow acne") that reads as a grey wash.
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.05;
  scene.add(sun);

  const landMat = new THREE.MeshStandardMaterial({ roughness: 1 });
  scene.add(buildIsland(landMat));

  for (const house of options.houses) scene.add(buildHouse(house));

  const hub = geoToScene(GRID_HUB.lng, GRID_HUB.lat);
  const grid = buildPowerGrid(
    new THREE.Vector3(hub.x, LAND_HEIGHT, hub.z),
    options.houses.map((house) => {
      const { x, z } = geoToScene(house.lng, house.lat);
      const roof = house.roof === "gable" ? GABLE_HEIGHT : FLAT_ROOF_HEIGHT;
      return new THREE.Vector3(
        x,
        LAND_HEIGHT + house.floors * FLOOR_HEIGHT + roof,
        z,
      );
    }),
  );
  scene.add(grid.group);
  let powerMotion = options.powerMotion;

  const centres = options.houses.map((house) => {
    const { x, z } = geoToScene(house.lng, house.lat);
    return new THREE.Vector3(x, LAND_HEIGHT, z);
  });
  // Half the house's footprint diagonal: how far from the centre a label sits.
  const reach = options.houses.map(
    (house) => Math.hypot(house.width, house.depth) / 2,
  );

  const setDark = (dark: boolean) => {
    landMat.color.set(dark ? LAND.dark : LAND.light);
  };
  setDark(options.dark);

  let width = 0;
  let height = 0;
  const resize = () => {
    width = container.clientWidth;
    height = container.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Narrow screens zoom out so the whole island still fits. Portrait
    // screens look from nearly overhead, so they need less room.
    camera.zoom = Math.min(1, camera.aspect / (camera.aspect < 1 ? 0.85 : 1.1));
    camera.updateProjectionMatrix();
  };
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  const turn = (radians: number) => {
    camera.position
      .sub(controls.target)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), radians)
      .add(controls.target);
    controls.update();
  };

  const projected = new THREE.Vector3();
  const towardCamera = new THREE.Vector3();
  const render = (time: number) => {
    grid.update(time / 1000, powerMotion);
    controls.update();
    renderer.render(scene, camera);
    // Each label hangs below the house: its base, on the side nearest the
    // camera, so it reads as "under" the model whichever way the view turns.
    towardCamera.copy(camera.position).sub(controls.target).setY(0).normalize();
    options.onFrame(
      centres.map((centre, i) =>
        ndcToScreen(
          projected
            .copy(centre)
            .addScaledVector(towardCamera, reach[i])
            .project(camera),
          width,
          height,
        ),
      ),
    );
  };

  let running = false;
  const setRunning = (next: boolean) => {
    if (next === running) return;
    running = next;
    renderer.setAnimationLoop(next ? render : null);
  };
  setRunning(true);

  return {
    setDark,
    setAutoRotate: (on) => {
      controls.autoRotate = on;
    },
    setPowerMotion: (on) => {
      powerMotion = on;
    },
    setPower: (statuses) => statuses.forEach((s, i) => grid.setStatus(i, s)),
    turn,
    setRunning,
    dispose: () => {
      setRunning(false);
      resizeObserver.disconnect();
      controls.dispose();
      scene.traverse((object) => {
        if (
          object instanceof THREE.Mesh ||
          object instanceof THREE.LineSegments
        ) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];
          materials.forEach((m: THREE.Material) => m.dispose());
        }
      });
      renderer.dispose();
      canvas.remove();
    },
  };
}
