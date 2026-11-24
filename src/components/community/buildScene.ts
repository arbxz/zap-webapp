import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import {
  FLOOR_HEIGHT,
  PAVEMENT_WIDTH,
  ROAD_WIDTH,
  type House,
  type ScreenPoint,
  houseZ,
  ndcToScreen,
} from "./houses";

// three.js takes plain colours, not CSS variables. These mirror the tokens in
// globals.css: ink, the brand violet and the lime accent-2.
const INK = "#040202";
const VIOLET = "#3d3bf3";
const LIME = "#def861";
const WALL = "#ffffff";
const ROOF = "#f1f1f3";

const GROUND = {
  light: { grass: "#e6e6ea", road: "#3a3838", pavement: "#cfcfd5" },
  dark: { grass: "#2a2421", road: "#121010", pavement: "#3d3633" },
};

export interface CommunitySceneOptions {
  houses: House[];
  dark: boolean;
  autoRotate: boolean;
  /** Called after each rendered frame with where each house's label goes. */
  onFrame: (points: ScreenPoint[]) => void;
}

export interface CommunityScene {
  setDark: (dark: boolean) => void;
  setAutoRotate: (on: boolean) => void;
  /** Turn the camera round the street; positive is to the left. */
  turn: (radians: number) => void;
  /** Pause rendering while the scene is off screen. */
  setRunning: (running: boolean) => void;
  dispose: () => void;
}

function withEdges(mesh: THREE.Mesh): THREE.Group {
  const group = new THREE.Group();
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
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
    const overhang = 0.25;
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2 - overhang, 0);
    shape.lineTo(w / 2 + overhang, 0);
    shape.lineTo(0, 1.1);
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
      new THREE.BoxGeometry(w + 0.3, 0.2, d + 0.3),
      roofMat,
    );
    slab.position.y = h + 0.1;
    slab.castShadow = true;
    group.add(withEdges(slab));
  }

  // Door and windows on the street side (local +z).
  const front = d / 2 + 0.03;
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 1.1, 0.06),
    new THREE.MeshStandardMaterial({ color: LIME }),
  );
  door.position.set(0, 0.55, front);
  group.add(withEdges(door));

  const glass = new THREE.MeshStandardMaterial({
    color: VIOLET,
    roughness: 0.3,
    metalness: 0.2,
  });
  const windowGeo = new THREE.BoxGeometry(0.6, 0.55, 0.06);
  for (let floor = 0; floor < house.floors; floor++) {
    const y = floor * FLOOR_HEIGHT + 0.95;
    const offsets = floor === 0 ? [-w / 3, w / 3] : [-w / 3, 0, w / 3];
    for (const x of offsets) {
      const pane = new THREE.Mesh(windowGeo, glass);
      pane.position.set(x, y, front);
      group.add(withEdges(pane));
    }
  }

  group.position.set(house.x, 0, houseZ(house));
  // North houses face +z already; south houses turn round to face the road.
  if (house.side === "south") group.rotation.y = Math.PI;
  return group;
}

export function createCommunityScene(
  container: HTMLElement,
  options: CommunitySceneOptions,
): CommunityScene {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);

  const canvas = renderer.domElement;
  canvas.setAttribute("role", "img");
  canvas.setAttribute(
    "aria-label",
    `A street of ${options.houses.length} white houses, three on each side. Drag sideways to turn the view.`,
  );
  canvas.className = "block size-full";
  // Vertical swipes still scroll the page on touch screens; sideways drags turn the view.
  canvas.style.touchAction = "pan-y";
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 0, 1);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.autoRotateSpeed = 0.5;
  controls.autoRotate = options.autoRotate;
  // Landscape screens get a three-quarter view across the street. On a
  // portrait screen three houses side by side leave no room for labels, so
  // the camera looks down from nearly overhead with the street running top
  // to bottom, and each row stacks down the screen.
  const portrait = container.clientWidth < container.clientHeight;
  const polar = portrait ? 0.45 : Math.atan2(24, 15);
  const azimuth = portrait ? Math.PI / 2 : 0;
  camera.position
    .setFromSpherical(new THREE.Spherical(Math.hypot(24, 15), polar, azimuth))
    .add(controls.target);
  // Turn around the street only; the tilt stays put.
  controls.minPolarAngle = polar;
  controls.maxPolarAngle = polar;
  controls.update();

  scene.add(new THREE.HemisphereLight("#ffffff", "#bdbdc6", 1.6));
  const sun = new THREE.DirectionalLight("#ffffff", 2.2);
  sun.position.set(8, 16, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, {
    left: -16,
    right: 16,
    top: 16,
    bottom: -16,
  });
  sun.shadow.bias = -0.0005;
  scene.add(sun);

  const grassMat = new THREE.MeshStandardMaterial({ roughness: 1 });
  const roadMat = new THREE.MeshStandardMaterial({ roughness: 1 });
  const pavementMat = new THREE.MeshStandardMaterial({ roughness: 1 });

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 24), grassMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const road = new THREE.Mesh(
    new THREE.BoxGeometry(30, 0.04, ROAD_WIDTH),
    roadMat,
  );
  road.position.y = 0.02;
  road.receiveShadow = true;
  scene.add(road);

  for (const sign of [-1, 1]) {
    const pavement = new THREE.Mesh(
      new THREE.BoxGeometry(30, 0.12, PAVEMENT_WIDTH),
      pavementMat,
    );
    pavement.position.set(
      0,
      0.06,
      sign * (ROAD_WIDTH / 2 + PAVEMENT_WIDTH / 2),
    );
    pavement.receiveShadow = true;
    scene.add(pavement);
  }

  const dashMat = new THREE.MeshBasicMaterial({ color: LIME });
  const dashGeo = new THREE.BoxGeometry(1.2, 0.02, 0.16);
  for (let x = -13.5; x <= 13.5; x += 2.5) {
    const dash = new THREE.Mesh(dashGeo, dashMat);
    dash.position.set(x, 0.05, 0);
    scene.add(dash);
  }

  for (const house of options.houses) scene.add(buildHouse(house));

  const centres = options.houses.map(
    (house) => new THREE.Vector3(house.x, 0, houseZ(house)),
  );
  // Half the house's footprint diagonal: how far from the centre a label sits.
  const reach = options.houses.map(
    (house) => Math.hypot(house.width, house.depth) / 2,
  );

  const setDark = (dark: boolean) => {
    const palette = dark ? GROUND.dark : GROUND.light;
    grassMat.color.set(palette.grass);
    roadMat.color.set(palette.road);
    pavementMat.color.set(palette.pavement);
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
    // Narrow screens zoom out so the whole street still fits.
    camera.zoom = Math.min(1, camera.aspect / 1.1);
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
  const render = () => {
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
