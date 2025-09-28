"use client";

import { MapIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { District } from "@/constants";
import { Dispatch, SetStateAction, useState } from "react";

interface RegionSelectorProps {
  setSelectedRegion: Dispatch<SetStateAction<string>>;
  selectedRegion: string;
  data: any;
}

const RegionSelector = ({
  setSelectedRegion,
  data,
}: RegionSelectorProps) => {

  const getLocalitiesByDistrict = (district: string) => {
    if (district === "all") {
      setSelectedRegion(district);
      return;
    }

    setSelectedRegion(district);
  };

  return (
    <div className="w-full lg:w-[300px] mt-12 transition-all duration-300">
      <div className="flex flex-col gap-4 items-center justify-start p-6 border border-blue-300 rounded-xl">
        <div
          className="p-4 rounded-full border-2 border-blue-300 animate-pulse transition-colors">
          <MapIcon width={36} height={36} className="text-blue-500"/>
        </div>
        <h3 className="text-blue-500 text-xl">Filter by district</h3>
        <Select
          onValueChange={(e) => {
            getLocalitiesByDistrict(e);
          }}>
          <SelectTrigger className="w-[180px] focus:ring-0">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            {District.map((district: string) => (
              <SelectItem
                className="capitalize"
                key={district}
                value={district}>
                {district}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
  
      </div>
    </div>
  );
};

export default RegionSelector;
