import { describe, expect, it } from "vitest";

import {
  KM_PER_UNIT,
  geoToScene,
  isInsidePolygon,
  ndcToScreen,
} from "@/components/community/geo";

describe("geoToScene", () => {
  it("puts north away from the camera (-z) and east to the right (+x)", () => {
    const portLouis = geoToScene(57.4989, -20.1619);
    const mahebourg = geoToScene(57.7, -20.4081);
    expect(portLouis.z).toBeLessThan(mahebourg.z);
    expect(portLouis.x).toBeLessThan(mahebourg.x);
  });

  it("keeps real distances: Port Louis to Curepipe is about 17 km", () => {
    const a = geoToScene(57.4989, -20.1619);
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
