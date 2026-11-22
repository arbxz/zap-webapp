import type { Data } from "@/app/types";

const OUTAGES_URL =
  "https://raw.githubusercontent.com/MrSunshyne/mauritius-dataset-electricity/main/data/power-outages.latest.json";

/** How long a fetched copy of the dataset is reused, in seconds. */
export const OUTAGES_REVALIDATE = 300;

export const EMPTY_OUTAGES: Data = { today: [], future: [] };

/**
 * Server-side read of the outage dataset, shared by the page (a Server
 * Component) and the /api route the notification poll uses. The dataset is
 * updated a few times a day, so a 5 minute cache spares GitHub a request per
 * visitor without showing stale data for long.
 */
export async function getOutages(): Promise<Data> {
  const res = await fetch(OUTAGES_URL, {
    next: { revalidate: OUTAGES_REVALIDATE },
  });
  if (!res.ok) {
    throw new Error(`Outage dataset responded ${res.status}`);
  }
  const data = (await res.json()) as Partial<Data>;
  return { today: data.today ?? [], future: data.future ?? [] };
}
