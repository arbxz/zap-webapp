import { describe, expect, it } from "vitest";

import {
  HOUSES,
  KM_PER_UNIT,
  geoToScene,
  houseDetails,
  isInsidePolygon,
  ndcToScreen,
} from "@/components/community/houses";
import { MAURITIUS_OUTLINE } from "@/components/community/mauritius";
import { District } from "@/constants";

describe("HOUSES", () => {
  it("has unique ids", () => {
    expect(new Set(HOUSES.map((h) => h.id)).size).toBe(HOUSES.length);
  });

  it("uses the app's district keys", () => {
    for (const house of HOUSES) {
      expect(District).toContain(house.district);
    }
  });

  it("puts every house on the island, not in the sea", () => {
    for (const house of HOUSES) {
      expect(
        isInsidePolygon([house.lng, house.lat], MAURITIUS_OUTLINE),
        house.locality,
      ).toBe(true);
    }
  });

  it("keeps houses far enough apart that they don't overlap", () => {
    for (let i = 0; i < HOUSES.length; i++) {
      for (let j = i + 1; j < HOUSES.length; j++) {
        const a = HOUSES[i];
        const b = HOUSES[j];
        const pa = geoToScene(a.lng, a.lat);
        const pb = geoToScene(b.lng, b.lat);
        const gap = Math.hypot(pa.x - pb.x, pa.z - pb.z);
        const reach =
          Math.hypot(a.width, a.depth) / 2 + Math.hypot(b.width, b.depth) / 2;
        expect(gap, `${a.locality} / ${b.locality}`).toBeGreaterThan(reach);
      }
    }
  });
});

describe("geoToScene", () => {
  it("puts north away from the camera (-z) and east to the right (+x)", () => {
    const portLouis = geoToScene(57.5012, -20.1619);
    const mahebourg = geoToScene(57.7, -20.4081);
    expect(portLouis.z).toBeLessThan(mahebourg.z);
    expect(portLouis.x).toBeLessThan(mahebourg.x);
  });

  it("keeps real distances: Port Louis to Curepipe is about 17 km", () => {
    const a = geoToScene(57.5012, -20.1619);
    const b = geoToScene(57.5259, -20.3163);
    const km = Math.hypot(a.x - b.x, a.z - b.z) * KM_PER_UNIT;
    expect(km).toBeGreaterThan(16);
    expect(km).toBeLessThan(18);
  });
});

describe("isInsidePolygon", () => {
  const square: [number, number][] = [
    [0, 0],
    [4, 0],
    [4, 4],
    [0, 4],
  ];

  it("finds points inside and outside", () => {
    expect(isInsidePolygon([2, 2], square)).toBe(true);
    expect(isInsidePolygon([5, 2], square)).toBe(false);
    expect(isInsidePolygon([2, -1], square)).toBe(false);
  });
});

describe("houseDetails", () => {
  it("formats bedrooms, floors and year, singular floor included", () => {
    const curepipe = HOUSES.find((h) => h.id === "curepipe")!;
    expect(houseDetails(curepipe)).toBe("5 bed · 2 floors · built 2019");
    expect(houseDetails(HOUSES.find((h) => h.floors === 1)!)).toContain(
      "1 floor ·",
    );
  });
});

describe("ndcToScreen", () => {
  it("maps the centre and corners", () => {
    expect(ndcToScreen({ x: 0, y: 0, z: 0 }, 800, 400)).toEqual({
      x: 400,
      y: 200,
      visible: true,
    });
    expect(ndcToScreen({ x: -1, y: 1, z: 0 }, 800, 400)).toMatchObject({
      x: 0,
      y: 0,
    });
    expect(ndcToScreen({ x: 1, y: -1, z: 0 }, 800, 400)).toMatchObject({
      x: 800,
      y: 400,
    });
  });

  it("hides points behind the camera or off screen", () => {
    expect(ndcToScreen({ x: 0, y: 0, z: 1.2 }, 800, 400).visible).toBe(false);
    expect(ndcToScreen({ x: 1.5, y: 0, z: 0 }, 800, 400).visible).toBe(false);
  });
});
