// Map maths shared by the scene and its tests: projecting longitude and
// latitude into scene units, point-in-polygon, and screen projection.

/** Roughly the middle of the main island; it becomes the scene's origin. */
const ORIGIN = { lat: -20.25, lng: 57.55 };
/** Kilometres of real ground per scene unit. */
export const KM_PER_UNIT = 2;
const KM_PER_DEGREE_LAT = 110.57;
const KM_PER_DEGREE_LNG = 111.32 * Math.cos((ORIGIN.lat * Math.PI) / 180);

/**
 * Longitude and latitude to scene x and z. Over an island 60 km across a flat
 * projection is accurate to well under a scene unit. North is -z, away from
 * the camera's starting position.
 */
export function geoToScene(lng: number, lat: number): { x: number; z: number } {
  return {
    x: ((lng - ORIGIN.lng) * KM_PER_DEGREE_LNG) / KM_PER_UNIT,
    z: ((ORIGIN.lat - lat) * KM_PER_DEGREE_LAT) / KM_PER_UNIT,
  };
}

/** Ray casting: is the point inside the polygon? */
export function isInsidePolygon(
  [x, y]: [number, number],
  polygon: [number, number][],
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

export interface ScreenPoint {
  x: number;
  y: number;
  visible: boolean;
}

/**
 * Normalised device coordinates (-1..1, z < 1 in front of the camera) to
 * pixels inside a box of the given size, origin top left.
 */
export function ndcToScreen(
  ndc: { x: number; y: number; z: number },
  width: number,
  height: number,
): ScreenPoint {
  const x = ((ndc.x + 1) / 2) * width;
  const y = ((1 - ndc.y) / 2) * height;
  const visible =
    ndc.z > -1 && ndc.z < 1 && x >= 0 && x <= width && y >= 0 && y <= height;
  return { x, y, visible };
}
