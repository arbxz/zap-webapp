"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

import Window from "@/components/window/Window";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Data, OutageItem } from "@/app/types";
import { useMemo, useSyncExternalStore } from "react";

interface ChartData {
  region: string;
  powercuts: number;
}

const Region: { [key: string]: string[] } = {
  north: ["pamplemousses", "rivieredurempart", "portlouis"],
  east: ["flacq", "grandport"],
  west: ["blackriver"],
  central: ["plainewilhems", "moka"],
  south: ["savanne"],
  rodrigues: ["rodrigues"],
};

const chartConfig = {
  powercuts: {
    label: "Outages",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

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

export function BarchartLabel({ data }: BarchartLabelProps) {
  const { today } = data;
  const formattedDate = useSyncExternalStore(
    noSubscription,
    getToday,
    getServerToday,
  );

  // Derived straight from props during render. Mirroring `today` into state and
  // recomputing in an effect cost an extra render pass per data change, and the
  // effect listed the very state it set as a dependency.
  const chartData: ChartData[] = useMemo(
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
      <ChartContainer className="h-full" config={chartConfig}>
        <BarChart
          accessibilityLayer
          data={chartData}
          // No Y axis, so the tallest bar reaches the top margin; its value
          // label sits above it and needs the room.
          margin={{
            top: 32,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="region"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            interval={0}
            fontSize={11}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar dataKey="powercuts" fill="var(--color-powercuts)">
            <LabelList
              position="top"
              offset={12}
              className="fill-foreground font-mono"
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
      <p className="font-mono text-xs text-window-muted">
        Total power cuts per region today.
      </p>
    </Window>
  );
}
