/** One house on the map. Sizes are in scene units. */
export interface House {
  id: string;
  name: string;
  /** Town or village, as shown on the label. */
  locality: string;
  /** District key, matching `District` in src/constants. */
  district: string;
  /**
   * The locality as the outage dataset spells it (see
   * src/constants/localities_output.json), used to look up outages.
   */
  outageLocality: string;
  lat: number;
  lng: number;
  bedrooms: number;
  floors: 1 | 2;
  built: number;
  roof: "gable" | "flat";
  width: number;
  depth: number;
}

export const FLOOR_HEIGHT = 1;

export const HOUSES: House[] = [
  {
    id: "port-louis",
    name: "Les Filaos",
    locality: "Port Louis",
    outageLocality: "PORT-LOUIS",
    district: "portlouis",
    lat: -20.1619,
    lng: 57.5012,
    bedrooms: 4,
    floors: 2,
    built: 2006,
    roof: "flat",
    width: 2.2,
    depth: 1.8,
  },
  {
    id: "grand-baie",
    name: "Villa Lagon",
    locality: "Grand Baie",
    outageLocality: "GRAND BAY",
    district: "rivieredurempart",
    lat: -20.0182,
    lng: 57.5802,
    bedrooms: 3,
    floors: 1,
    built: 1998,
    roof: "gable",
    width: 2.4,
    depth: 2,
  },
  {
    id: "centre-de-flacq",
    name: "Ti Kaz",
    locality: "Centre de Flacq",
    outageLocality: "CENTRAL FLACQ",
    district: "flacq",
    lat: -20.1897,
    lng: 57.7144,
    bedrooms: 2,
    floors: 1,
    built: 1987,
    roof: "flat",
    width: 2,
    depth: 1.8,
  },
  {
    id: "flic-en-flac",
    name: "Maison Corail",
    locality: "Flic en Flac",
    outageLocality: "FLIC-EN-FLAC",
    district: "blackriver",
    lat: -20.2817,
    lng: 57.3778,
    bedrooms: 2,
    floors: 1,
    built: 2015,
    roof: "gable",
    width: 2,
    depth: 1.8,
  },
  {
    id: "curepipe",
    name: "Villa Bougainville",
    locality: "Curepipe",
    outageLocality: "CUREPIPE",
    district: "plainewilhems",
    lat: -20.3163,
    lng: 57.5259,
    bedrooms: 5,
    floors: 2,
    built: 2019,
    roof: "gable",
    width: 2.6,
    depth: 2.2,
  },
  {
    id: "mahebourg",
    name: "Les Badamiers",
    locality: "Mahébourg",
    outageLocality: "MAHEBOURG",
    district: "grandport",
    lat: -20.4081,
    lng: 57.7,
    bedrooms: 3,
    floors: 2,
    built: 2011,
    roof: "flat",
    width: 2.2,
    depth: 1.8,
  },
];

export function houseDetails(house: House): string {
  const beds = `${house.bedrooms} bed`;
  const floors = house.floors === 1 ? "1 floor" : `${house.floors} floors`;
  return `${beds} · ${floors} · built ${house.built}`;
}

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
