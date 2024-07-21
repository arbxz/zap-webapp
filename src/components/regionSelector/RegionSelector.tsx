import { Zap } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { District } from "@/app/types";

const RegionSelector = () => {
  const isRegionSelected = false;
  // write util function to get district
  return (
    <div className="max-w-[300px] flex flex-col p-6 shadow gap-4 items-center justify-center rounded-lg mt-12">
      <div className="p-4 rounded-full border-2 animate-pulse ">
        <Zap width={36} height={36} />
      </div>
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Region" />
        </SelectTrigger>
        <SelectContent>
          {District.map((region: string) => (
            <SelectItem className="capitalize" key={region} value={region}>
              {region}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isRegionSelected && (
        <div>
          <p className="text-center text-gray-600 mb-2 ">
            Expect a powercut in these regions today.
          </p>

          <ul className="text-center grid gap-2">
            <li className="px-4 py-4 border-b-[1px] ">Region a</li>
            <li className="px-4 py-4 border-b-[1px] ">Region a</li>
            <li className="px-4 py-4 border-b-[1px] ">Region a</li>
            <li className="px-4 py-4 border-b-[1px] ">Region a</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default RegionSelector;
