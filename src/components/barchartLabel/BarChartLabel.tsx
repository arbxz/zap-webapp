"use client";

import { TrendingUp } from "lucide-react";
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
import { useEffect, useState } from "react";

interface ChartData {
  region: string;
  powercuts: number;
}

// const chartData: ChartData[] = [
//   { month: "January", desktop: 186 },
//   { month: "February", desktop: 305 },
//   { month: "March", desktop: 237 },
//   { month: "April", desktop: 73 },
//   { month: "May", desktop: 209 },
//   { month: "June", desktop: 214 },
// ];

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
    color: "rgb(217 249 157 / var(--tw-bg-opacity, 1))",
  },
} satisfies ChartConfig;

interface BarchartLabelProps {
  data: Data;
}

export function BarchartLabel({ data }: BarchartLabelProps) {
  const { today } = data;
  const [chartRawData, setChartRawData] = useState<OutageItem[]>(today);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const date = new Date();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const formattedDate = `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  const [biggestPowerCut, setBiggestPowerCut] = useState<{
    region: string;
    powercut: number;
  }>({ region: "", powercut: 0 });

  useEffect(() => {
    const results = Object.keys(Region).map((region) => {
      const powercuts = chartRawData.filter((item) =>
        Region[region].includes(item.district)
      ).length;

      if (powercuts > biggestPowerCut.powercut) {
        setBiggestPowerCut({ region: region, powercut: powercuts });
      }

      return {
        region,
        powercuts,
      };
    });


    setChartData(results);
  }, [biggestPowerCut, chartRawData]);

  useEffect(() => {
    setChartRawData(today);
  }, [today]);

  return (
    <Card className="text-stone-500">
      <CardHeader>
        <CardTitle >Outages Chart</CardTitle>
        <CardDescription>{formattedDate}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-fit" config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
            }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="region"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 5)}
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
                fontSize={12}
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
