import { describe, expect, it } from "vitest";

import type { OutageItem } from "@/app/types";
import { HOUSES } from "@/components/community/houses";
import { normaliseLocality, powerStatus } from "@/components/community/power";
import localities from "@/constants/localities_output.json";

const curepipe = HOUSES.find((h) => h.id === "curepipe")!;

function outage(overrides: Partial<OutageItem>): OutageItem {
  return {
    date: "",
    locality: "CUREPIPE",
    streets: "",
    district: "plainewilhems",
    from: new Date("2026-11-29T04:30:00.000Z"),
    to: new Date("2026-11-29T13:00:00.000Z"),
    id: "x",
    ...overrides,
  };
}

const during = new Date("2026-11-29T08:00:00.000Z");

describe("houses and the outage dataset", () => {
  it("spell every locality the way the dataset does", () => {
    const districts = localities.districts as Record<string, string[]>;
    for (const house of HOUSES) {
      expect(districts[house.district], house.locality).toContain(
        house.outageLocality,
      );
    }
  });
});

describe("normaliseLocality", () => {
  it("ignores case, accents and punctuation", () => {
    expect(normaliseLocality("Flic-en-Flac")).toBe("FLIC EN FLAC");
    expect(normaliseLocality("Mahébourg")).toBe("MAHEBOURG");
    expect(normaliseLocality(" PORT-LOUIS ")).toBe("PORT LOUIS");
  });
});

describe("powerStatus", () => {
  it("is off while an outage for the house's locality is running", () => {
    expect(powerStatus(curepipe, [outage({})], during)).toEqual({
      state: "off",
      until: new Date("2026-11-29T13:00:00.000Z"),
    });
  });

  it("is on before the outage starts and once it ends", () => {
    const outages = [outage({})];
    expect(
      powerStatus(curepipe, outages, new Date("2026-11-29T04:29:00.000Z")),
    ).toEqual({ state: "on" });
    expect(
      powerStatus(curepipe, outages, new Date("2026-11-29T13:00:00.000Z")),
    ).toEqual({ state: "on" });
  });

  it("works with dates as JSON strings, the way the dataset sends them", () => {
    const fromJson = JSON.parse(JSON.stringify([outage({})])) as OutageItem[];
    expect(powerStatus(curepipe, fromJson, during).state).toBe("off");
  });

  it("ignores outages in other localities or districts", () => {
    expect(
      powerStatus(curepipe, [outage({ locality: "PHOENIX" })], during),
    ).toEqual({ state: "on" });
    expect(
      powerStatus(curepipe, [outage({ district: "moka" })], during),
    ).toEqual({ state: "on" });
  });

  it("is unknown when the outage data couldn't be loaded", () => {
    expect(powerStatus(curepipe, null, during)).toEqual({ state: "unknown" });
  });
});
