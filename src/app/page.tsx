"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { Moon, Sun, Zap } from "lucide-react";
import RegionSelector from "@/components/regionSelector/RegionSelector";
import OutageTable from "@/components/outageTable/OutageTable";
import { Data } from "./types";
import { useTheme } from "next-themes";
import { BarchartLabel } from "@/components/barchartLabel/BarChartLabel";

export default function Home() {
  const [outageData, setOutageData] = useState<Data>({
    today: [],
    future: [],
  });
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const { setTheme } = useTheme();

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
      <nav className="flex justify-start items-center gap-8 w-full mb-8">
        <div className="animate-pulse bg-green-600 dark:bg-red-600 text-white flex gap-4 items-center font-semibold px-4 py-2 rounded-full border-2 shadow">
          <Zap /> zap
        </div>
        <span className="ml-auto text-sm">
          <a href="https://github.com/MrSunshyne" target="_blank">
            Contributors : Sandeep Ramgolam ( api )
          </a>
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
      <div className="grid md:grid-flow-col md:grid-cols-[1fr_auto] gap-8 items-start justify-start mb-8">
        <div className="flex flex-col justify-center items-center mb-4 gap-4 h-full md:py-16 p-4 md:px-8 shadow shadow-slate-200 dark:shadow-primary-foreground rounded-xl overflow-hidden">
          <div
            className={`p-4 rounded-full border-2 border-green-600 dark:border-red-600  animate-pulse transition-colors 
          }`}>
            <Zap width={36} height={36} />
          </div>
          <h1 className="text-4xl font-semibold text-green-600 dark:text-red-600">
            ZAP <span className="animate-ping text-2xl">|</span>
          </h1>
          <h2 className="text-xl">
            Monitor power outages
            <br /> in Mauritius.
          </h2>
        </div>

        <BarchartLabel data={outageData} />
      </div>
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
    </main>
  );
}
