import { HomeIcon, PlugZap, Plus } from "lucide-react";
import { LocationTypeIcons } from "@/constants/savedLocation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import localitiesData from "@/constants/localities_output.json";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Data } from "@/app/types";

interface ILocationMonitorProps {
  outageData: Data;
}

const LocationMonitor = ({ outageData }: ILocationMonitorProps) => {
  const [localitiesList, setLocalitiesList] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedLocality, setSelectedLocality] = useState("");
  const [locationType, setLocationType] = useState("");
  const [savedLocations, setSavedLocations] = useState<
    { district: string; locality: string; type: string }[]
  >([]);

  const getLocalitiesByDistrict = (district: string) => {
    if (!district) return [];
    const key = district.toLowerCase().replace(/\s+/g, "");
    // Type assertion to fix TS error
    return (localitiesData.districts as Record<string, string[]>)[key] || [];
  };

  // Get unique districts from localitiesData
  const getDistricts = () => {
    return Object.keys(localitiesData.districts).map(
      (key: string) => key.charAt(0).toUpperCase() + key.slice(1),
    );
  };

  const locationTypes = ["Home", "Work", "Other"];

  const formReset = () => {
    // Optionally reset form
    setSelectedDistrict("");
    setSelectedLocality("");
    setLocationType("");
    setLocalitiesList([]);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDistrict && selectedLocality && locationType) {
      const updated = [
        ...savedLocations,
        {
          district: selectedDistrict,
          locality: selectedLocality,
          type: locationType,
        },
      ];
      setSavedLocations(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem("savedLocations", JSON.stringify(updated));
      }
      formReset();
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("savedLocations");
      if (stored) {
        setSavedLocations(JSON.parse(stored));
      }
    }
  }, []);

  return (
    <div className="grid w-full grid-cols-3 gap-8 py-4">
      {savedLocations.map(
        (
          location: { district: string; locality: string; type: string },
          index: number,
        ) => {
          const iconKey =
            location.type.toLowerCase() as keyof typeof LocationTypeIcons;
          const IconComponent = LocationTypeIcons[iconKey]?.icon || HomeIcon;
          const label = LocationTypeIcons[iconKey]?.label || location.type;
          return (
            <div
              key={index}
              className="flex flex-col rounded-xl border border-blue-300 p-4 text-stone-500"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-4 text-lg">
                  <IconComponent size={24} />
                  <div>
                    <div className="capitalize">{label}</div>
                    <div className="text-sm">{location.locality}</div>
                  </div>
                </div>
                <PlugZap size={20} className="text-blue-500" />
              </div>
              <div>
                <div>
                  <h4>Planned outages</h4>
                  <ul className="space-y-2 py-2">
                    {/* Show today's outages for this locality if any */}
                    {outageData.today
                      .filter((item) => item.locality === location.locality)
                      .map((item, idx) => (
                        <li key={"today-" + idx}>
                          <p className="text-md">
                            Today :{" "}
                            {new Date(item.from).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            to{" "}
                            {new Date(item.to).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </li>
                      ))}
                    {/* Show future outages for this locality if any */}
                    {outageData.future
                      .filter((item) => item.locality === location.locality)
                      .map((item, idx) => (
                        <li key={"future-" + idx}>
                          <p className="text-md">
                            {new Date(item.from).toLocaleDateString("en", {
                              weekday: "long",
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })}{" "}
                            as from{" "}
                            {new Date(item.from).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            to{" "}
                            {new Date(item.to).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </li>
                      ))}
                    {/* If no outages */}
                    {outageData.today.filter(
                      (item) => item.locality === location.locality,
                    ).length === 0 &&
                      outageData.future.filter(
                        (item) => item.locality === location.locality,
                      ).length === 0 && (
                        <li>
                          <p className="text-md text-stone-400">
                            No planned outages for{" "}
                            <span className="capitalize">
                              {location.locality}
                            </span>
                            .
                          </p>
                        </li>
                      )}
                  </ul>
                </div>
              </div>
            </div>
          );
        },
      )}

      <Dialog>
        <DialogTrigger>
          <div className="flex h-full cursor-pointer flex-col items-center justify-center rounded-xl bg-blue-500 p-8 text-white transition-transform duration-200 hover:scale-95">
            <Plus size={48} className="mb-2" />
            <p className="text-center text-xl">
              Add a location
              <br /> to monitor
            </p>
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <h2 className="mb-4 text-lg text-stone-500">
              Add your home, office or any other location you want to monitor
              for power outages.
            </h2>
            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              {/* District Dropdown */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col justify-start gap-2">
                  <span className="text-sm text-stone-600">
                    Select your district
                  </span>
                  <Select
                    onValueChange={(district) => {
                      setSelectedDistrict(district);
                      setLocalitiesList(getLocalitiesByDistrict(district));
                      setSelectedLocality("");
                      setLocationType("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your district" />
                    </SelectTrigger>
                    <SelectContent>
                      {getDistricts().map((district: string) => (
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

                <div className="flex flex-col justify-start gap-2">
                  <span className="text-sm text-stone-600">
                    Choose your locality
                  </span>

                  <Select
                    onValueChange={(locality) => {
                      setSelectedLocality(locality);
                      setLocationType("");
                    }}
                    disabled={!selectedDistrict}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your locality" />
                    </SelectTrigger>
                    <SelectContent>
                      {localitiesList.map((locality: string) => (
                        <SelectItem
                          className="capitalize"
                          key={locality}
                          value={locality}
                        >
                          {locality}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Type Dropdown */}
                <div className="flex flex-col justify-start gap-2">
                  <span className="text-sm text-stone-600">
                    Choose the location type
                  </span>

                  <Select
                    onValueChange={(type) => setLocationType(type)}
                    disabled={!selectedLocality}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select the location type" />
                    </SelectTrigger>
                    <SelectContent>
                      {locationTypes.map((type: string) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary" type="button" onClick={formReset}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={
                    !(selectedDistrict && selectedLocality && locationType)
                  }
                >
                  Save changes
                </Button>
              </DialogFooter>
            </form>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LocationMonitor;
