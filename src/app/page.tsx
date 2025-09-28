"use client";

import * as React from "react";

import { useEffect, useState } from "react";
import RegionSelector from "@/components/regionSelector/RegionSelector";
import OutageTable from "@/components/outageTable/OutageTable";
import { Data } from "./types";
import { BarchartLabel } from "@/components/barchartLabel/BarChartLabel";
import Navigation from "@/components/navigation/Navigation";
import LocationMonitor from "@/components/locationMonitor/LocationMonitor";
import Footer from "@/components/footer/Footer";

export default function Home() {
  const [outageData, setOutageData] = useState<Data>({
    today: [],
    future: [],
  });
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDataFromAPI = async () => {
      try {
        const response = await fetch("/api", { cache: "no-store" });
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
    <main className="relative min-h-screen p-8 lg:p-12">
      <Navigation />

      <div className="grid grid-cols-2 items-start justify-start gap-8 md:grid-cols-3">
        <div className="mb-4 flex h-full flex-col items-center justify-center gap-4 overflow-hidden rounded-xl bg-blue-500 p-4 md:p-8">
          <h2 className="text-xl text-white">
            Monitor power outages
            <br /> in Mauritius.
          </h2>
        </div>

        <div className="mb-4 flex h-full flex-col items-center justify-center gap-4 overflow-hidden rounded-xl bg-blue-500 p-4 md:p-8">
          <p className="text-5xl text-white">15:00</p>
        </div>

        {/* <BarchartLabel data={outageData} /> */}
      </div>

      <LocationMonitor outageData={outageData} />

      <div className="flex w-full flex-wrap gap-8 lg:flex-nowrap">
        <RegionSelector
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          data={outageData}
        />
        <OutageTable
          selectedRegion={selectedRegion}
          isLoading={loading}
          data={outageData || []}
        />
      </div>

      <Footer />
    </main>
  );
}
