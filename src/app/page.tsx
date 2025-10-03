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
import { SunDim } from "lucide-react";

export default function Home() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

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

  useEffect(() => {
    // Only run interval on client
    if (typeof window === "undefined") return;
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="relative mx-auto min-h-screen max-w-7xl overflow-hidden px-8 lg:px-12">
      <div className="background-grid absolute left-0 top-0 h-full w-full"></div>

      <div className="relative z-50">
        <Navigation />

        <div className="mb-8 flex w-full items-center justify-between text-xl">
          <div>Overview</div>

          <div className="flex items-baseline gap-4">
            <div className="uppercase">
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </div>
            <div className="text-sm text-stone-500">time</div>
          </div>

          <div className="capitalize">
            {currentTime
              .toLocaleDateString("en-GB", { day: "numeric", month: "long" })
              .toLowerCase()}
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 items-start justify-start gap-8 lg:grid-cols-3">
          <div className="flex h-full flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl bg-yellow-300 p-4 md:p-8">
            <h2 className="text-3xl font-bold text-black">
              Monitor power outages
              <br /> live in Mauritius.
            </h2>
          </div>

          <div className="glass flex h-full flex-col items-center justify-between gap-4 overflow-hidden rounded-2xl border border-yellow-500/30 p-4 text-foreground shadow-lg shadow-transparent transition-all duration-200 hover:shadow-yellow-500/10 dark:hover:shadow-yellow-400/20 md:p-6">
            <SunDim size={64} className="mr-auto text-yellow-300" />
            <p className="text-right text-3xl">
              Remember you can always go green and become independent from the
              grid using{" "}
              <b className="text-yellow-500 dark:text-yellow-300">
                solar energy
              </b>
              .
            </p>
          </div>

          <BarchartLabel data={outageData} />
        </div>

        <LocationMonitor outageData={outageData} />

        <section
          id="outage_list"
          className="flex w-full flex-wrap gap-8 lg:flex-nowrap"
        >
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
        </section>

        <Footer />
      </div>
    </main>
  );
}
