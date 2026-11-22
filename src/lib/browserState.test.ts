import { afterEach, describe, expect, it, vi } from "vitest";

import {
  readSavedLocations,
  writeSavedLocations,
  type SavedLocation,
} from "@/lib/browserState";

const home: SavedLocation = {
  district: "Moka",
  locality: "phoenix",
  type: "Home",
};
const work: SavedLocation = {
  district: "Portlouis",
  locality: "port louis",
  type: "Work",
};

afterEach(() => {
  window.localStorage.clear();
});

describe("saved locations", () => {
  it("reads back what was written", () => {
    writeSavedLocations([home, work]);

    expect(readSavedLocations()).toEqual([home, work]);
    expect(JSON.parse(window.localStorage.getItem("savedLocations")!)).toEqual([
      home,
      work,
    ]);
  });

  it("returns an empty list when nothing is stored", () => {
    expect(readSavedLocations()).toEqual([]);
  });

  it("returns an empty list for corrupt JSON instead of throwing", () => {
    window.localStorage.setItem("savedLocations", "{not json");

    expect(readSavedLocations()).toEqual([]);
  });

  it("returns an empty list when the stored value is not an array", () => {
    window.localStorage.setItem("savedLocations", '{"locality":"phoenix"}');

    expect(readSavedLocations()).toEqual([]);
  });

  it("tells same-tab subscribers about a write", () => {
    // The storage event only fires in other tabs, so the writer has to
    // announce the change itself or this tab's UI goes stale.
    const listener = vi.fn();
    window.addEventListener("zap:saved-locations-changed", listener);

    writeSavedLocations([home]);

    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener("zap:saved-locations-changed", listener);
  });

  it("keeps the same array between reads of an unchanged value", () => {
    // useSyncExternalStore loops forever if the snapshot is a new array
    // on every call.
    writeSavedLocations([home]);

    expect(readSavedLocations()).toBe(readSavedLocations());
  });
});
