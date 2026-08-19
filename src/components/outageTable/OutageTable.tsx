"use client";

import { Data, OutageItem } from "@/app/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo } from "react";
import { DataTable } from "@/components/dataTable/dataTable";
import { columns } from "@/components/dataTable/columns";

interface OutageTableProps {
  data: Data;
  isLoading: boolean;
  selectedRegion: string;
}

const OutageTable = ({ data, selectedRegion }: OutageTableProps) => {
  // Both lists are a pure function of `data` and `selectedRegion`, so they are
  // computed during render. The previous pair of effects rendered the unfiltered
  // data first and then corrected it, and the second effect fully superseded the
  // first — every data change ran both.
  const todayData: OutageItem[] = useMemo(
    () =>
      selectedRegion === "all"
        ? data.today
        : data.today.filter(
            (item: OutageItem) => item.district === selectedRegion,
          ),
    [data, selectedRegion],
  );

  const futureData: OutageItem[] = useMemo(
    () =>
      selectedRegion === "all"
        ? data.future
        : data.future.filter(
            (item: OutageItem) => item.district === selectedRegion,
          ),
    [data, selectedRegion],
  );

  return (
    <Tabs defaultValue="account" className="flex w-full flex-col">
      <TabsList className="mx-auto">
        <TabsTrigger value="account">Today</TabsTrigger>
        <TabsTrigger value="password">Future outages</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <DataTable columns={columns} data={todayData} />
      </TabsContent>
      <TabsContent className="w-full" value="password">
        <DataTable columns={columns} data={futureData} />
      </TabsContent>
    </Tabs>
  );
};

export default OutageTable;
