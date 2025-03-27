"use client";

import { Data, OutageItem } from "@/app/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/dataTable/dataTable";
import { columns } from "@/components/dataTable/columns";

interface OutageTableProps {
  data: Data;
  isLoading: boolean;
  selectedRegion: string;
}

const OutageTable = ({ data, selectedRegion }: OutageTableProps) => {
  const [todayData, setTodayData] = useState<OutageItem[]>([]);
  const [futureData, setFutureData] = useState<OutageItem[]>([]);

  useEffect(() => {
    const { today, future } = data;

    setTodayData(today);
    setFutureData(future);
  }, [data]);

  useEffect(() => {
    if (selectedRegion === "all") {
      setTodayData(data.today);
      setFutureData(data.future);
    } else {
      const todayData = data.today.filter(
        (item: OutageItem) => item.district === selectedRegion
      );
      const futureData = data.future.filter(
        (item: OutageItem) => item.district === selectedRegion
      );

      setTodayData(todayData);
      setFutureData(futureData);
    }
  }, [selectedRegion, data]);

  return (
    <Tabs defaultValue="account" className="flex flex-col w-full">
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
