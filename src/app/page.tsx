import OutageDashboard from "@/components/outageDashboard/OutageDashboard";
import { EMPTY_OUTAGES, getOutages } from "@/lib/outages";

// Rebuilt in the background at most every 5 minutes (OUTAGES_REVALIDATE).
export const revalidate = 300;

async function loadOutages() {
  try {
    return { data: await getOutages(), loadFailed: false };
  } catch (error) {
    console.error(error);
    return { data: EMPTY_OUTAGES, loadFailed: true };
  }
}

// A Server Component: the outage list is in the HTML on first paint instead
// of arriving from a client fetch after hydration.
export default async function Home() {
  const { data, loadFailed } = await loadOutages();
  return <OutageDashboard initialData={data} loadFailed={loadFailed} />;
}
