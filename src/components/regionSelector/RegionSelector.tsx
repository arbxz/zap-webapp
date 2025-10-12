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
import { Dispatch, SetStateAction } from "react";

interface RegionSelectorProps {
  setSelectedRegion: Dispatch<SetStateAction<string>>;
  selectedRegion: string;
  data: unknown;
}

const RegionSelector = ({ setSelectedRegion }: RegionSelectorProps) => {
  const getLocalitiesByDistrict = (district: string) => {
    if (district === "all") {
      setSelectedRegion(district);
      return;
    }

    setSelectedRegion(district);
  };

  return (
    <div className="mt-12 w-full transition-all duration-300 lg:w-[375px]">
      <div className="glass flex flex-col items-center justify-start gap-4 rounded-2xl border border-yellow-500/40 p-6">
        <div className="animate-pulse rounded-full p-4 transition-colors">
          <MapIcon width={36} height={36} className="text-yellow-500" />
        </div>
        <h3 className="text-xl text-foreground">Filter by district</h3>
        <Select
          onValueChange={(e) => {
            getLocalitiesByDistrict(e);
          }}
        >
          <SelectTrigger className="w-[180px] focus:ring-0">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            {District.map((district: string) => (
              <SelectItem
                className="capitalize"
                key={district}
                value={district}
              >
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
