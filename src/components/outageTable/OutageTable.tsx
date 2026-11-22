"use client";

import { Data, OutageItem } from "@/app/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/dataTable/dataTable";
import { columns } from "@/components/dataTable/columns";
import { District } from "@/constants";

interface OutageTableProps {
  data: Data;
}

// The dataset keys districts without spaces or accents.
const districtLabels: Record<string, string> = {
  all: "All districts",
  blackriver: "Black River",
  flacq: "Flacq",
  grandport: "Grand Port",
  moka: "Moka",
  pamplemousses: "Pamplemousses",
  plainewilhems: "Plaines Wilhems",
  portlouis: "Port Louis",
  rivieredurempart: "Rivière du Rempart",
  savanne: "Savanne",
  rodrigues: "Rodrigues",
};

const byDistrict = (items: OutageItem[], district: string) =>
  district === "all"
    ? items
    : items.filter((item) => item.district === district);

const OutageTable = ({ data }: OutageTableProps) => {
  const [district, setDistrict] = useState("all");

  // Pure functions of `data` and `district`, so computed during render.
  const todayData = useMemo(
    () => byDistrict(data.today, district),
    [data, district],
  );
  const futureData = useMemo(
    () => byDistrict(data.future, district),
    [data, district],
  );

  const districtFilter = (
    <Select value={district} onValueChange={setDistrict}>
      <SelectTrigger
        aria-label="Filter by district"
        className="w-full normal-case sm:w-52"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {District.map((key) => (
          <SelectItem key={key} value={key}>
            {districtLabels[key] ?? key}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <Tabs defaultValue="today" className="flex w-full flex-col">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-wider text-window-muted uppercase">
            {"// Outages"}
          </p>
          <h2 className="mt-2 text-2xl font-bold">
            Every planned cut
            <span className="text-arbxz-accent-text">.</span>
          </h2>
        </div>
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="future">Upcoming</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="today">
        <DataTable
          columns={columns}
          data={todayData}
          toolbar={districtFilter}
        />
      </TabsContent>
      <TabsContent className="w-full" value="future">
        <DataTable
          columns={columns}
          data={futureData}
          toolbar={districtFilter}
        />
      </TabsContent>
    </Tabs>
  );
};

export default OutageTable;
