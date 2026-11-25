import type { OutageItem } from "@/app/types";

export type PowerStatus =
  | { state: "on" }
  | { state: "off"; until: Date }
  /** The outage data couldn't be loaded, so we can't say. */
  | { state: "unknown" };

/** Where to look up outages: a district key and the dataset's locality name. */
export interface OutageArea {
  district: string;
  locality: string;
}

/** "Flic-en-Flac", "FLIC EN FLAC" and "flic en flac" all become "FLIC EN FLAC". */
export function normaliseLocality(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim();
}

function outagesFor(area: OutageArea, outages: OutageItem[]): OutageItem[] {
  const locality = normaliseLocality(area.locality);
  return outages.filter(
    (outage) =>
      outage.district === area.district &&
      normaliseLocality(outage.locality) === locality,
  );
}

/**
 * Whether the area has power at `now`: off while a planned outage for its
 * district and locality is running, on otherwise.
 */
export function powerStatus(
  area: OutageArea,
  outages: OutageItem[] | null,
  now: Date,
): PowerStatus {
  if (!outages) return { state: "unknown" };
  const current = outagesFor(area, outages).find(
    (outage) => new Date(outage.from) <= now && now < new Date(outage.to),
  );
  return current
    ? { state: "off", until: new Date(current.to) }
    : { state: "on" };
}

/** The next planned outage that hasn't started yet, if any. */
export function nextOutage(
  area: OutageArea,
  outages: OutageItem[] | null,
  now: Date,
): { from: Date; to: Date } | undefined {
  if (!outages) return undefined;
  return outagesFor(area, outages)
    .map((outage) => ({ from: new Date(outage.from), to: new Date(outage.to) }))
    .filter(({ from }) => from > now)
    .sort((a, b) => a.from.getTime() - b.from.getTime())[0];
}
