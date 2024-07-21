"use client";

import { Zap } from "lucide-react";
import RegionSelector from "@/components/regionSelector/RegionSelector";
import OutageTable from "@/components/outageTable/OutageTable";
import { useEffect, useState } from "react";
import { ApiResponse, OutageItem } from "./types";

export default function Home() {
  const [data, setData] = useState<OutageItem[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDataFromAPI = async () => {
      try {
        const response = await fetch(process.env.URL + "/api");
        if (response) {
          const item: ApiResponse = await response.json();
          setData(item.data.outage);
          console.log(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDataFromAPI();
  }, [data]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-24">
      <nav className="mb-8">
        <div className="animate-pulse flex gap-4 items-center font-semibold px-4 py-2 rounded-full border-2">
          <Zap /> zap
        </div>
      </nav>
      <div className="flex gap-8 w-full">
        <RegionSelector />
        <OutageTable data={data} />
      </div>
    </main>
  );
}
