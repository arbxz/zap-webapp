"use client";

import { HomeIcon, PlugZap, Trash2, Unplug } from "lucide-react";
import { LocationTypeIcons } from "@/constants/savedLocation";

import { useEffect, useState } from "react";

import { Data } from "@/app/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import AddLocationForm from "./AddLocationForm";
// import { AddToCalendarButton } from "add-to-calendar-button-react";

interface ILocationMonitorProps {
  outageData: Data;
}

const LocationMonitor = ({ outageData }: ILocationMonitorProps) => {
  const [savedLocations, setSavedLocations] = useState<
    { district: string; locality: string; type: string }[]
  >([]);

  const deleteLocation = (index: number) => {
    const updated = savedLocations.filter((_, i) => i !== index);
    setSavedLocations(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("savedLocations", JSON.stringify(updated));
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
    <div className="relative z-50 py-8">
      <h2 className="text-xl">Saved Locations</h2>
      <div className="mb-4 text-muted-foreground">
        Save locations you wish to monitor like your home or office.
      </div>
      <div className="grid w-full grid-cols-1 gap-8 py-4 md:grid-cols-2 lg:grid-cols-3">
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
                className="glass group flex select-none flex-col overflow-hidden rounded-2xl border border-yellow-200/80 p-4 text-stone-700 transition-all duration-200 hover:bg-yellow-300 dark:border-yellow-100/20 dark:text-stone-200 dark:shadow-cyan-500/10 dark:hover:border-yellow-500/80 dark:hover:text-stone-800 dark:hover:shadow-lg lg:p-8"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-lg">
                    <IconComponent size={24} />
                    <div>
                      <div className="px-4 font-semibold capitalize">
                        {label}
                      </div>
                      <div className="rounded-full bg-yellow-300 px-4 py-1 text-sm font-semibold text-black">
                        {location.locality}
                      </div>
                    </div>
                  </div>
                  {(() => {
                    // Check if there is a current outage for this locality
                    const now = new Date();
                    const hasCurrentOutage = outageData.today.some(
                      (item) =>
                        item.locality === location.locality &&
                        new Date(item.from) <= now &&
                        new Date(item.to) >= now,
                    );
                    return hasCurrentOutage ? (
                      <Unplug size={36} className="animate-pulse text-black" />
                    ) : (
                      <PlugZap
                        size={36}
                        className="text-yellow-500 group-hover:text-black"
                      />
                    );
                  })()}
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
                          <li
                            key={"future-" + idx}
                            className="flex flex-col items-start gap-2 border-b border-yellow-400 pb-2 last:border-0 group-hover:border-black"
                          >
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

                            {/* <AddToCalendarButton
                              name={`CEB Power Outage - ${location.locality}, ${location.district}`}
                              options="['Apple','Google','iCal','Microsoft365','Outlook.com','Yahoo']"
                              startDate={
                                new Date(item.from).toISOString().split("T")[0]
                              }
                              endDate={
                                new Date(item.to).toISOString().split("T")[0]
                              }
                              startTime={new Date(item.from).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                },
                              )}
                              endTime={new Date(item.to).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                },
                              )}
                              timeZone="Indian/Mauritius"
                              iCalFileName="Outage-Notification"
                              buttonStyle="text"
                              size="4"
                              hideCheckmark
                              hideBackground
                            /> */}
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
                            <p className="text-md text-stone-400 group-hover:text-stone-700 dark:text-stone-200">
                              No planned outages for{" "}
                              <span className="capitalize">
                                {location.locality}
                              </span>
                            </p>
                          </li>
                        )}
                    </ul>
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      name="delete saved location"
                      className="absolute -bottom-24 right-2 block rounded-full p-2 transition-all duration-200 hover:bg-red-500 hover:text-red-100 group-hover:bottom-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure you want to remove this
                        location?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        You can always add it again, no worries.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteLocation(index)}>
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            );
          },
        )}

        <AddLocationForm
          savedLocations={savedLocations}
          setSavedLocations={setSavedLocations}
        />
      </div>
    </div>
  );
};

export default LocationMonitor;
