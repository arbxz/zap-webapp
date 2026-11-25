import { describe, expect, it } from "vitest";

import type { OutageItem } from "@/app/types";
import {
  nextOutage,
  normaliseLocality,
  powerStatus,
} from "@/components/community/power";

const curepipe = { district: "plainewilhems", locality: "CUREPIPE" };

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

describe("nextOutage", () => {
  it("finds the soonest outage that hasn't started", () => {
    const later = outage({
      from: new Date("2026-12-02T04:30:00.000Z"),
      to: new Date("2026-12-02T10:00:00.000Z"),
    });
    const sooner = outage({
      from: new Date("2026-12-01T04:30:00.000Z"),
      to: new Date("2026-12-01T10:00:00.000Z"),
    });
    expect(nextOutage(curepipe, [later, sooner, outage({})], during)).toEqual({
      from: new Date("2026-12-01T04:30:00.000Z"),
      to: new Date("2026-12-01T10:00:00.000Z"),
    });
  });

  it("is undefined with nothing planned or no data", () => {
    expect(nextOutage(curepipe, [outage({})], during)).toBeUndefined();
    expect(nextOutage(curepipe, null, during)).toBeUndefined();
  });
});
