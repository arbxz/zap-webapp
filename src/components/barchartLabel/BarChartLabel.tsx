"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Data, OutageItem } from "@/app/types";
import { useMemo } from "react";

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
  desktop: {
    label: "Desktop",
    color: "rgb(253 224 71 / var(--tw-bg-opacity, 1))",
  },
} satisfies ChartConfig;

interface BarchartLabelProps {
  data: Data;
}

export function BarchartLabel({ data }: BarchartLabelProps) {
  const { today } = data;
  const date = new Date();
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
  const formattedDate = `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;

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
    <Card className="hidden h-full text-stone-900 dark:text-stone-100 lg:block">
      <CardHeader>
        <CardTitle>Outages Chart</CardTitle>
        <CardDescription>{formattedDate}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-full" config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="region"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value: string) => String(value).slice(0, 5)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="powercuts" fill="var(--color-desktop)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={14}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing total powercuts for all regions.
        </div>
      </CardFooter>
    </Card>
  );
}
