"use client";

import { useEffect, useState } from "react";
import { Github, Zap } from "lucide-react";
import RegionSelector from "@/components/regionSelector/RegionSelector";
import OutageTable from "@/components/outageTable/OutageTable";
import { OutageItem } from "./types";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [outageData, setOutageData] = useState<OutageItem[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDataFromAPI = async () => {
      try {
        const response = await fetch("/api");
        if (response) {
          const item = await response.json();

          setOutageData(item.data);
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDataFromAPI();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-8 lg:p-24 relative">
      <nav className="flex justify-start items-center w-full mb-8">
        <div className="animate-pulse flex gap-4 items-center font-semibold px-4 py-2 rounded-full border-2">
          <Zap /> zap
        </div>
        <div className="ml-auto">
          <code>
            <a href="https://github.com/MrSunshyne" target="_blank">
              Api by : Sandeep Ramgolam
            </a>
          </code>
        </div>
      </nav>
      <div className="flex flex-wrap lg:flex-nowrap gap-8 w-full">
        <RegionSelector
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          data={outageData}
        />
        <OutageTable
          selectedRegion={selectedRegion}
          isLoading={loading}
          data={outageData}
        />
      </div>
    </main>
  );
}
