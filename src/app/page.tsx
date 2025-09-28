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
    <main className="min-h-screen p-8 lg:p-12 relative">
   
      <Navigation />

      <div className="grid md:grid-cols-3 grid-cols-2 gap-8 items-start justify-start">
        <div className="flex flex-col justify-center items-center mb-4 gap-4 h-full bg-blue-500 p-4 md:p-8 rounded-xl overflow-hidden">

          <h2 className="text-xl text-white">
            Monitor power outages
            <br /> in Mauritius.
          </h2>
        </div>

        <div className="flex flex-col justify-center items-center mb-4 gap-4 h-full  bg-blue-500 p-4 md:p-8 rounded-xl overflow-hidden">
          <p className="text-5xl text-white">15:00</p>
        </div>

        {/* <BarchartLabel data={outageData} /> */}
      </div>

      <LocationMonitor outageData={outageData} />
    
      
      <div className="flex flex-wrap lg:flex-nowrap gap-8 w-full">
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
