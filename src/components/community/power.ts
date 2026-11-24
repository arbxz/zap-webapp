import type { OutageItem } from "@/app/types";

import type { House } from "./houses";

export type PowerStatus =
  | { state: "on" }
  | { state: "off"; until: Date }
  /** The outage data couldn't be loaded, so we can't say. */
  | { state: "unknown" };

/** "Flic-en-Flac", "FLIC EN FLAC" and "flic en flac" all become "FLIC EN FLAC". */
export function normaliseLocality(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim();
}

/**
 * Whether the house has power at `now`: off while a planned outage for its
 * district and locality is running, on otherwise.
 */
export function powerStatus(
  house: House,
  outages: OutageItem[] | null,
  now: Date,
): PowerStatus {
  if (!outages) return { state: "unknown" };
  const locality = normaliseLocality(house.outageLocality);
  const current = outages.find(
    (outage) =>
      outage.district === house.district &&
      normaliseLocality(outage.locality) === locality &&
      new Date(outage.from) <= now &&
      now < new Date(outage.to),
  );
  return current
    ? { state: "off", until: new Date(current.to) }
    : { state: "on" };
}
