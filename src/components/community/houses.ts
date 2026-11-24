/** One house on the street. Sizes are in scene units (about a metre each). */
export interface House {
  id: string;
  /** Street number, shown on the label. */
  number: number;
  name: string;
  bedrooms: number;
  floors: 1 | 2;
  built: number;
  roof: "gable" | "flat";
  /** Which side of the street: north faces +z, south faces -z. */
  side: "north" | "south";
  /** Position along the street. */
  x: number;
  width: number;
  depth: number;
}

export const STREET_NAME = "Rue des Flamboyants";
/** Road width, centred on z = 0. */
export const ROAD_WIDTH = 4;
/** Pavement width on each side of the road. */
export const PAVEMENT_WIDTH = 1.2;
/** Gap between the pavement and the front of a house. */
export const FRONT_YARD = 1.4;
export const FLOOR_HEIGHT = 1.6;

export const HOUSES: House[] = [
  {
    id: "h1",
    number: 1,
    name: "Villa Lagon",
    bedrooms: 3,
    floors: 1,
    built: 1998,
    roof: "gable",
    side: "north",
    x: -7,
    width: 4,
    depth: 3.4,
  },
  {
    id: "h3",
    number: 3,
    name: "Les Filaos",
    bedrooms: 4,
    floors: 2,
    built: 2006,
    roof: "flat",
    side: "north",
    x: 0,
    width: 3.6,
    depth: 3.2,
  },
  {
    id: "h5",
    number: 5,
    name: "Maison Corail",
    bedrooms: 2,
    floors: 1,
    built: 2015,
    roof: "gable",
    side: "north",
    x: 7,
    width: 3.4,
    depth: 3,
  },
  {
    id: "h2",
    number: 2,
    name: "Ti Kaz",
    bedrooms: 2,
    floors: 1,
    built: 1987,
    roof: "flat",
    side: "south",
    x: -7,
    width: 3.2,
    depth: 3,
  },
  {
    id: "h4",
    number: 4,
    name: "Villa Bougainville",
    bedrooms: 5,
    floors: 2,
    built: 2019,
    roof: "gable",
    side: "south",
    x: 0,
    width: 4.2,
    depth: 3.6,
  },
  {
    id: "h6",
    number: 6,
    name: "Les Badamiers",
    bedrooms: 3,
    floors: 2,
    built: 2011,
    roof: "flat",
    side: "south",
    x: 7,
    width: 3.6,
    depth: 3.2,
  },
];

/** z of the house's centre: road, pavement and front yard, then half its depth. */
export function houseZ(house: House): number {
  const front = ROAD_WIDTH / 2 + PAVEMENT_WIDTH + FRONT_YARD;
  const z = front + house.depth / 2;
  return house.side === "north" ? -z : z;
}

export function houseAddress(house: House): string {
  return `No. ${house.number}, ${STREET_NAME}`;
}

export function houseDetails(house: House): string {
  const beds = `${house.bedrooms} bed`;
  const floors = house.floors === 1 ? "1 floor" : `${house.floors} floors`;
  return `${beds} · ${floors} · built ${house.built}`;
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
