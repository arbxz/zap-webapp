import coordinates from "@/constants/localityCoordinates.json";
import type { SavedLocation } from "@/lib/browserState";

/**
 * How sure we are of a place's position (see
 * scripts/build-locality-coordinates.mjs):
 * exact: GeoNames has the locality by name in its district.
 * near: part of the name matched, e.g. a neighbourhood placed at its town.
 * district: no match, so it stands at the district's centre.
 */
export type Precision = "exact" | "near" | "district";

/** One house on the map: a saved locality, with everything saved there. */
export interface MapPlace {
  /** `${district}|${locality}`, stable across renders. */
  id: string;
  district: string;
  /** The locality exactly as the outage dataset spells it. */
  locality: string;
  /** The locality tidied up for display: "Belle Rose (Q Bornes)". */
  name: string;
  districtName: string;
  /** What the visitor saved it as: Home, Work, Other. */
  types: string[];
  lat: number;
  lng: number;
  precision: Precision;
}

export const DISTRICT_NAMES: Record<string, string> = {
  blackriver: "Black River",
  flacq: "Flacq",
  grandport: "Grand Port",
  moka: "Moka",
  pamplemousses: "Pamplemousses",
  plainewilhems: "Plaines Wilhems",
  portlouis: "Port Louis",
  rivieredurempart: "Rivière du Rempart",
  savanne: "Savanne",
  rodrigues: "Rodrigues",
};

/** The 3D map covers the main island only (Rodrigues is 560 km east). */
const MAIN_ISLAND = { west: 57.2, east: 57.9, south: -20.6, north: -19.9 };

type Coordinates = Record<string, Record<string, [number, number, Precision]>>;
const COORDINATES = coordinates as unknown as Coordinates;

/** "BELLE ROSE  ( Q BORNES )" -> "Belle Rose (Q Bornes)" */
export function displayLocality(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\s*\(\s*/g, " (")
    .replace(/\s*\)/g, ")")
    .replace(
      /(^|[\s(-])([a-zà-ÿ])/g,
      (_, before: string, letter: string) => before + letter.toUpperCase(),
    )
    .trim();
}

/**
 * Turns saved locations into houses for the map. Places saved twice (Home
 * and Work in the same locality) share one house. Anything the main-island
 * map can't show, like Rodrigues or a locality with no known position, comes
 * back in `offMap` so the page can say so.
 */
export function placeSavedLocations(saved: SavedLocation[]): {
  places: MapPlace[];
  offMap: SavedLocation[];
} {
  const byId = new Map<string, MapPlace>();
  const offMap: SavedLocation[] = [];

  for (const location of saved) {
    const position = COORDINATES[location.district]?.[location.locality];
    const [lat, lng, precision] = position ?? [];
    const onMainIsland =
      lat !== undefined &&
      lng !== undefined &&
      lng > MAIN_ISLAND.west &&
      lng < MAIN_ISLAND.east &&
      lat > MAIN_ISLAND.south &&
      lat < MAIN_ISLAND.north;
    if (!onMainIsland || precision === undefined) {
      offMap.push(location);
      continue;
    }

    const id = `${location.district}|${location.locality}`;
    const existing = byId.get(id);
    if (existing) {
      if (!existing.types.includes(location.type)) {
        existing.types.push(location.type);
      }
      continue;
    }
    byId.set(id, {
      id,
      district: location.district,
      locality: location.locality,
      name: displayLocality(location.locality),
      districtName: DISTRICT_NAMES[location.district] ?? location.district,
      types: [location.type],
      lat,
      lng,
      precision,
    });
  }

  return { places: [...byId.values()], offMap };
}

/** Size and roof for a place's house: decoration only, not data. */
export interface HouseShape {
  width: number;
  depth: number;
  floors: 1 | 2;
  roof: "gable" | "flat";
}

/**
 * Houses vary so the map doesn't look stamped out, but a place keeps the
 * same house on every visit: the shape comes from a hash of its id.
 */
export function houseShape(id: string): HouseShape {
  let hash = 2166136261;
  for (let i = 0; i < id.length; i++) {
    hash = Math.imul(hash ^ id.charCodeAt(i), 16777619);
  }
  const pick = (bits: number) => ((hash >>> bits) & 0xff) / 255;
  return {
    width: 1.4 + pick(0) * 0.6,
    depth: 1.2 + pick(8) * 0.4,
    floors: pick(16) < 0.5 ? 1 : 2,
    roof: pick(24) < 0.5 ? "gable" : "flat",
  };
}
