import * as THREE from "three";

import type { PowerStatus } from "./power";

const INK = "#040202";
const LIME = "#def861";
/**
 * A line with no power turns the danger colour (--color-danger,
 * hsl(15 85% 48%)), so it stands out on the grey island. The label says the
 * same in words. An unknown status keeps the line grey.
 */
const CUT = "#e25112";
const UNKNOWN = "#8a8a92";

const PYLON_HEIGHT = 3;
const PULSES_PER_LINE = 3;
/** Trips along a line per second. */
const PULSE_SPEED = 0.3;
/** How far a line sags below the straight path at its middle. */
const SAG = 0.7;

export interface PowerGrid {
  group: THREE.Group;
  setStatus: (index: number, status: PowerStatus) => void;
  /**
   * Move the pulses. With motion off they stay put, spread along each line,
   * so the line still reads as live.
   */
  update: (seconds: number, motion: boolean) => void;
}

function buildPylon(base: THREE.Vector3): THREE.Group {
  const pylon = new THREE.Group();
  const white = new THREE.MeshStandardMaterial({ color: "#ffffff" });
  const edges = new THREE.LineBasicMaterial({ color: INK });
  const parts: [THREE.BoxGeometry, THREE.Vector3][] = [
    [
      new THREE.BoxGeometry(0.25, PYLON_HEIGHT, 0.25),
      new THREE.Vector3(0, PYLON_HEIGHT / 2, 0),
    ],
    [
      new THREE.BoxGeometry(1.4, 0.12, 0.12),
      new THREE.Vector3(0, PYLON_HEIGHT - 0.3, 0),
    ],
  ];
  for (const [geometry, offset] of parts) {
    const mesh = new THREE.Mesh(geometry, white);
    mesh.position.copy(offset);
    mesh.castShadow = true;
    const outline = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      edges,
    );
    outline.position.copy(offset);
    pylon.add(mesh, outline);
  }
  pylon.position.copy(base);
  return pylon;
}

/**
 * A pylon at `hub` with a line to each house's roof. Lines sag like real
 * cables; lime pulses run from the pylon to every house that has power.
 */
export function buildPowerGrid(
  hub: THREE.Vector3,
  roofs: THREE.Vector3[],
): PowerGrid {
  const group = new THREE.Group();
  group.add(buildPylon(hub));

  const top = hub.clone().setY(hub.y + PYLON_HEIGHT - 0.3);
  const pulseGeometry = new THREE.SphereGeometry(0.14, 12, 8);
  const pulseMaterial = new THREE.MeshBasicMaterial({ color: LIME });

  const lines = roofs.map((roof) => {
    const middle = top.clone().lerp(roof, 0.5);
    middle.y -= SAG;
    const curve = new THREE.QuadraticBezierCurve3(top, middle, roof);
    const material = new THREE.MeshBasicMaterial({ color: INK });
    const cable = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 32, 0.04, 6, false),
      material,
    );
    const pulses = Array.from({ length: PULSES_PER_LINE }, () => {
      const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
      group.add(pulse);
      return pulse;
    });
    group.add(cable);
    return { curve, material, pulses, live: true };
  });

  return {
    group,
    setStatus: (index, status) => {
      const line = lines[index];
      line.live = status.state === "on";
      line.material.color.set(
        line.live ? INK : status.state === "off" ? CUT : UNKNOWN,
      );
      for (const pulse of line.pulses) pulse.visible = line.live;
    },
    update: (seconds, motion) => {
      const progress = motion ? seconds * PULSE_SPEED : 0.15;
      for (const line of lines) {
        if (!line.live) continue;
        line.pulses.forEach((pulse, k) => {
          const t = (progress + k / PULSES_PER_LINE) % 1;
          line.curve.getPointAt(t, pulse.position);
        });
      }
    },
  };
}
