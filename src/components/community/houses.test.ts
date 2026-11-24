import { describe, expect, it } from "vitest";

import {
  FRONT_YARD,
  HOUSES,
  PAVEMENT_WIDTH,
  ROAD_WIDTH,
  houseAddress,
  houseDetails,
  houseZ,
  ndcToScreen,
} from "@/components/community/houses";

describe("HOUSES", () => {
  it("has unique ids and street numbers", () => {
    expect(new Set(HOUSES.map((h) => h.id)).size).toBe(HOUSES.length);
    expect(new Set(HOUSES.map((h) => h.number)).size).toBe(HOUSES.length);
  });

  it("puts odd numbers on the north side and even on the south", () => {
    for (const house of HOUSES) {
      expect(house.side).toBe(house.number % 2 ? "north" : "south");
    }
  });

  it("keeps every house off the road and pavement", () => {
    const kerb = ROAD_WIDTH / 2 + PAVEMENT_WIDTH;
    for (const house of HOUSES) {
      const front = Math.abs(houseZ(house)) - house.depth / 2;
      expect(front).toBeCloseTo(kerb + FRONT_YARD);
    }
  });

  it("doesn't overlap neighbours on the same side", () => {
    for (const side of ["north", "south"] as const) {
      const row = HOUSES.filter((h) => h.side === side).sort(
        (a, b) => a.x - b.x,
      );
      for (let i = 1; i < row.length; i++) {
        const gap =
          row[i].x - row[i].width / 2 - (row[i - 1].x + row[i - 1].width / 2);
        expect(gap).toBeGreaterThan(0);
      }
    }
  });
});

describe("house labels", () => {
  const house = HOUSES.find((h) => h.id === "h4")!;

  it("formats the address", () => {
    expect(houseAddress(house)).toBe("No. 4, Rue des Flamboyants");
  });

  it("formats the details, singular floor included", () => {
    expect(houseDetails(house)).toBe("5 bed · 2 floors · built 2019");
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
