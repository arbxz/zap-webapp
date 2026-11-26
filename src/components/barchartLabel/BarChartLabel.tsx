"use client";

import dynamic from "next/dynamic";
import { useMemo, useSyncExternalStore } from "react";

import Window from "@/components/window/Window";
import { Data, OutageItem } from "@/app/types";
import type { RegionCount } from "./RegionBarChart";

const Region: { [key: string]: string[] } = {
  north: ["pamplemousses", "rivieredurempart", "portlouis"],
  east: ["flacq", "grandport"],
  west: ["blackriver"],
  central: ["plainewilhems", "moka"],
  south: ["savanne"],
  rodrigues: ["rodrigues"],
};

interface BarchartLabelProps {
  data: Data;
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Today's date is read on the client only. The page is prerendered at build
// time, so a server-rendered date was the build date and mismatched on
// hydration on any later day.
const noSubscription = () => () => {};
const getToday = () => {
  const date = new Date();
  return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
};
const getServerToday = () => "";

// The chart's window only shows from Tailwind's lg breakpoint up. Phones never
// see it, so they shouldn't download and run recharts (~370 KB) for it. The
// placeholder has the chart's aspect ratio, so nothing moves when it loads.
const LARGE = "(min-width: 64rem)";
const subscribeToLarge = (onChange: () => void) => {
  const query = window.matchMedia(LARGE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const getLargeSnapshot = () => window.matchMedia(LARGE).matches;
const getServerLarge = () => false;

const RegionBarChart = dynamic(() => import("./RegionBarChart"), {
  ssr: false,
  loading: () => <div aria-hidden="true" className="aspect-video h-full" />,
});

export function BarchartLabel({ data }: BarchartLabelProps) {
  const { today } = data;
  const formattedDate = useSyncExternalStore(
    noSubscription,
    getToday,
    getServerToday,
  );
  const isLarge = useSyncExternalStore(
    subscribeToLarge,
    getLargeSnapshot,
    getServerLarge,
  );

  // Derived straight from props during render. Mirroring `today` into state and
  // recomputing in an effect cost an extra render pass per data change, and the
  // effect listed the very state it set as a dependency.
  const chartData: RegionCount[] = useMemo(
    () =>
      Object.keys(Region).map((region) => ({
        region,
        powercuts: today.filter((item: OutageItem) =>
          Region[region].includes(item.district),
        ).length,
      })),
    [today],
  );

  return (
    <Window
      title="outages.chart"
      meta={formattedDate}
      className="hidden lg:flex"
      bodyClassName="flex flex-col gap-4 p-6"
    >
      <h2 className="text-lg font-bold">Outages today, by region</h2>
      {isLarge ? (
        <RegionBarChart data={chartData} />
      ) : (
        <div aria-hidden="true" className="aspect-video h-full" />
      )}
      <p className="font-mono text-xs text-window-muted">
        Total power cuts per region today.
      </p>
    </Window>
  );
}
