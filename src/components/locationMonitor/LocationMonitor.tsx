"use client";

import { HomeIcon, PlugZap, Trash2, Unplug } from "lucide-react";
import { LocationTypeIcons } from "@/constants/savedLocation";

import { Data } from "@/app/types";
import { useSavedLocations, writeSavedLocations } from "@/lib/browserState";
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
import Window from "@/components/window/Window";

interface ILocationMonitorProps {
  outageData: Data;
}

const LocationMonitor = ({ outageData }: ILocationMonitorProps) => {
  // Subscribed rather than copied into state on mount, so a location added in
  // AddLocationForm shows up here immediately instead of on the next mount.
  const savedLocations = useSavedLocations();

  const deleteLocation = (index: number) => {
    writeSavedLocations(savedLocations.filter((_, i) => i !== index));
  };

  return (
    <section aria-label="Saved locations" className="py-8">
      <p className="font-mono text-xs tracking-wider text-window-muted uppercase">
        {"// Saved locations"}
      </p>
      <h2 className="mt-2 text-2xl font-bold">
        Places you watch<span className="text-arbxz-accent-text">.</span>
      </h2>
      <p className="mb-4 text-window-muted">
        Save the places you care about, like home or the office.
      </p>

      <ul className="grid w-full grid-cols-1 gap-6 py-4 md:grid-cols-2 lg:grid-cols-3">
        {savedLocations.map(
          (
            location: { district: string; locality: string; type: string },
            index: number,
          ) => {
            const iconKey =
              location.type.toLowerCase() as keyof typeof LocationTypeIcons;
            const IconComponent = LocationTypeIcons[iconKey]?.icon || HomeIcon;
            const label = LocationTypeIcons[iconKey]?.label || location.type;
            const now = new Date();
            const hasCurrentOutage = outageData.today.some(
              (item) =>
                item.locality === location.locality &&
                new Date(item.from) <= now &&
                new Date(item.to) >= now,
            );
            return (
              <Window
                as="li"
                key={index}
                tone={hasCurrentOutage ? "accent" : "ink"}
                title={`${label.toLowerCase()}.loc`}
                meta={
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        type="button"
                        aria-label={`Remove ${location.locality}`}
                        className="-m-1 grid size-6 place-items-center transition-transform hover:text-danger active:scale-90"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Remove {location.locality}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          You can add it again any time.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteLocation(index)}
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                }
                bodyClassName="p-4 lg:p-6"
              >
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <IconComponent size={24} aria-hidden="true" />
                    <span className="bg-accent-2 px-3 py-1 font-mono text-xs font-bold text-ink uppercase">
                      {location.locality}
                    </span>
                  </div>
                  {hasCurrentOutage ? (
                    <span className="flex items-center gap-2 font-mono text-xs font-bold text-danger-text uppercase">
                      <Unplug size={20} aria-hidden="true" />
                      Outage now
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 font-mono text-xs text-success-text uppercase">
                      <PlugZap size={20} aria-hidden="true" />
                      Powered
                    </span>
                  )}
                </div>
                <div>
                  <div>
                    <h3 className="font-mono text-xs tracking-wider text-window-muted uppercase">
                      Planned outages
                    </h3>
                    <ul className="space-y-2 py-2">
                      {/* Show today's outages for this locality if any */}
                      {outageData.today
                        .filter((item) => item.locality === location.locality)
                        .map((item, idx) => (
                          <li key={"today-" + idx}>
                            <p>
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
                            className="flex flex-col items-start gap-2 border-b border-window-border pb-2 last:border-0"
                          >
                            <p>
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
                            <p className="text-window-muted">
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
              </Window>
            );
          },
        )}

        <li className="min-h-48">
          <AddLocationForm />
        </li>
      </ul>
    </section>
  );
};

export default LocationMonitor;
