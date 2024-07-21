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
import { OutageItem } from "./types";
import { useTheme } from "next-themes";

export default function Home() {
  const [outageData, setOutageData] = useState<OutageItem[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const { setTheme } = useTheme();

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
    <main className="flex min-h-screen flex-col items-center justify-start p-8 lg:p-12 relative">
      <nav className="flex justify-start items-center gap-8 w-full mb-8">
        <div className="animate-pulse flex gap-4 items-center font-semibold px-4 py-2 rounded-full border-2">
          <Zap /> zap
        </div>
        <code className="ml-auto">
          <a href="https://github.com/MrSunshyne" target="_blank">
            Api by : Sandeep Ramgolam
          </a>
        </code>

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
