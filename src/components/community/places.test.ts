import { describe, expect, it } from "vitest";

import { isInsidePolygon } from "@/components/community/geo";
import { MAURITIUS_OUTLINE } from "@/components/community/mauritius";
import {
  displayLocality,
  houseShape,
  placeSavedLocations,
} from "@/components/community/places";
import coordinates from "@/constants/localityCoordinates.json";
import localities from "@/constants/localities_output.json";

const COORDS = coordinates as unknown as Record<
  string,
  Record<string, [number, number, string]>
>;

describe("locality coordinates", () => {
  const districts = localities.districts as Record<string, string[]>;

  it("cover every locality people can save", () => {
    for (const [district, names] of Object.entries(districts)) {
      for (const name of names) {
        expect(COORDS[district]?.[name], `${district}: ${name}`).toBeDefined();
      }
    }
  });

  it("put each district's places on the right island", () => {
    for (const [district, places] of Object.entries(COORDS)) {
      for (const [name, [, lng]] of Object.entries(places)) {
        expect(lng > 60, `${district}: ${name}`).toBe(district === "rodrigues");
      }
    }
  });

  it("place well-known towns where they are", () => {
    // Checked by hand against a map; each within ~1 km of the town centre.
    expect(COORDS.plainewilhems.CUREPIPE.slice(0, 2)).toEqual([
      -20.3163, 57.5259,
    ]);
    expect(COORDS.portlouis["PORT-LOUIS"][2]).toBe("exact");
    // The town of Grand Baie, not the bay of the same name.
    expect(COORDS.rivieredurempart["GRAND BAY"].slice(0, 2)).toEqual([
      -20.0182, 57.5802,
    ]);
  });

  it("put most main-island places inside the coastline", () => {
    const main = Object.entries(COORDS)
      .filter(([district]) => district !== "rodrigues")
      .flatMap(([, places]) => Object.values(places));
    const inside = main.filter(([lat, lng]) =>
      isInsidePolygon([lng, lat], MAURITIUS_OUTLINE),
    );
    // A few coastal villages sit just off the simplified outline.
    expect(inside.length / main.length).toBeGreaterThan(0.97);
  });
});

describe("placeSavedLocations", () => {
  it("places a saved location at its locality", () => {
    const { places, offMap } = placeSavedLocations([
      { district: "plainewilhems", locality: "CUREPIPE", type: "Home" },
    ]);
    expect(offMap).toEqual([]);
    expect(places).toEqual([
      {
        id: "plainewilhems|CUREPIPE",
        district: "plainewilhems",
        locality: "CUREPIPE",
        name: "Curepipe",
        districtName: "Plaines Wilhems",
        types: ["Home"],
        lat: -20.3163,
        lng: 57.5259,
        precision: "exact",
      },
    ]);
  });

  it("gives one house to a locality saved twice", () => {
    const { places } = placeSavedLocations([
      { district: "portlouis", locality: "PORT-LOUIS", type: "Home" },
      { district: "portlouis", locality: "PORT-LOUIS", type: "Work" },
    ]);
    expect(places).toHaveLength(1);
    expect(places[0].types).toEqual(["Home", "Work"]);
  });

  it("leaves Rodrigues and unknown localities off the main-island map", () => {
    const rodrigues = Object.keys(COORDS.rodrigues)[0];
    const { places, offMap } = placeSavedLocations([
      { district: "rodrigues", locality: rodrigues, type: "Other" },
      { district: "moka", locality: "NOT A PLACE", type: "Work" },
    ]);
    expect(places).toEqual([]);
    expect(offMap).toHaveLength(2);
  });
});

describe("displayLocality", () => {
  it("tidies the dataset's spelling", () => {
    expect(displayLocality("BELLE ROSE  ( Q BORNES )")).toBe(
      "Belle Rose (Q Bornes)",
    );
    expect(displayLocality("FLIC-EN-FLAC")).toBe("Flic-En-Flac");
    expect(displayLocality("PORT-LOUIS")).toBe("Port-Louis");
    expect(displayLocality("ANSE QUITOR(RODRIGUES)")).toBe(
      "Anse Quitor (Rodrigues)",
    );
  });
});

describe("houseShape", () => {
  it("gives a place the same house every time", () => {
    expect(houseShape("moka|MOKA")).toEqual(houseShape("moka|MOKA"));
  });
});
