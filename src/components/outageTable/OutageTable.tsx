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

  function formatDate(dateString: string) {
    const date = new Date(dateString);

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // getMonth() is zero-based
    const year = date.getFullYear().toString().substr(-2); // Get last 2 digits of year

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

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
