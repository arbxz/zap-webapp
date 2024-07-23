"use client";

import { Zap } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { District } from "@/constants";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { OutageItem } from "@/app/types";

interface RegionSelectorProps {
  setSelectedRegion: Dispatch<SetStateAction<string>>;
  selectedRegion: string;
  data: any;
}

const RegionSelector = ({
  setSelectedRegion,
  data,
  selectedRegion,
}: RegionSelectorProps) => {
  const [locality, setLocality] = useState([]);
  const { today } = data;

  const getLocalitiesByDistrict = (district: string) => {
    if (district === "all") {
      setSelectedRegion(district);
      setLocality([]);
      return;
    }

    const results = today
      .filter(
        (item: OutageItem) =>
          item.district.toLowerCase() === district.toLowerCase()
      )
      .reduce((uniqueLocalities: string[], item: OutageItem) => {
        const locality = item.locality;
        if (!uniqueLocalities.includes(locality)) {
          uniqueLocalities.push(locality);
        }
        return uniqueLocalities;
      }, []);

    setSelectedRegion(district);
    setLocality(results);
  };

  return (
    <div className="w-full lg:w-[300px] mt-12 transition-all duration-300">
      <div className="flex flex-col gap-4 items-center justify-start p-6 shadow shadow-primary-foreground rounded-lg">
        <div
          className={`p-4 rounded-full border-2 border-green-600 dark:border-red-600  animate-pulse transition-colors  ${
            locality.length > 0 && "text-white bg-green-600 "
          }`}>
          <Zap width={36} height={36} />
        </div>
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
        {selectedRegion && locality.length > 0 ? (
          <div>
            <p className="text-center text-gray-600 mb-2 ">
              Expect a powercut in these regions today.
            </p>

            <ul className="text-center grid gap-2">
              {locality.map((item) => (
                <li
                  key={item}
                  className="px-4 py-4 border-b-[1px] capitalize text-sm">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div>No outages</div>
        )}
      </div>
    </div>
  );
};

export default RegionSelector;
