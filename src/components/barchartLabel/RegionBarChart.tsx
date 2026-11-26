"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export interface RegionCount {
  region: string;
  powercuts: number;
}

const chartConfig = {
  powercuts: {
    label: "Outages",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

/** The recharts half of the outages chart, in its own chunk (see BarChartLabel). */
export default function RegionBarChart({ data }: { data: RegionCount[] }) {
  return (
    <ChartContainer className="h-full" config={chartConfig}>
      <BarChart
        accessibilityLayer
        data={data}
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
  );
}
