"use client";

import { useEffect, useRef } from "react";
import { Data, OutageItem } from "@/app/types";
import {
  notifyPermissionChanged,
  readSavedLocations,
  useNotificationPermission,
} from "@/lib/browserState";

// Request notification permission
const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    notifyPermissionChanged();
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    notifyPermissionChanged();
    return permission === "granted";
  }

  return false;
};

// Show notification for new outage
const showOutageNotification = (outage: OutageItem) => {
  if (Notification.permission !== "granted") return;

  const fromTime = new Date(outage.from).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const toTime = new Date(outage.to).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  new Notification("⚡ Power Outage Alert", {
    body: `New outage detected in ${outage.locality}\n${fromTime} - ${toTime}\n${outage.streets}`,
    icon: "/icon.png",
    badge: "/badge.png",
    tag: `outage-${outage.id}`,
    requireInteraction: true,
    silent: false,
  });
};

// Notify about outages in saved locations that weren't in the previous
// check, then remember this check's outages. Shared by the data-change and
// polling paths, which used to carry two copies of this logic.
const notifyNewOutages = (
  data: Data,
  previousOutagesRef: { current: OutageItem[] },
) => {
  const savedLocations = readSavedLocations();
  if (savedLocations.length === 0) return;

  const relevantOutages = [...data.today, ...data.future].filter((outage) =>
    savedLocations.some((loc) => loc.locality === outage.locality),
  );

  relevantOutages
    .filter(
      (outage) =>
        !previousOutagesRef.current.some(
          (prevOutage) => prevOutage.id === outage.id,
        ),
    )
    .forEach(showOutageNotification);

  previousOutagesRef.current = relevantOutages;
};

export const useOutageNotifications = (outageData: Data) => {
  // Derived from the browser rather than mirrored into state by a mount effect,
  // which rendered `false` once before correcting itself.
  const notificationsEnabled = useNotificationPermission() === "granted";
  const previousOutagesRef = useRef<OutageItem[]>([]);
  const hasRequestedPermission = useRef(false);

  // Auto-request permission when user saves first location
  useEffect(() => {
    const savedLocations = readSavedLocations();
    if (
      savedLocations.length > 0 &&
      !hasRequestedPermission.current &&
      Notification.permission === "default"
    ) {
      hasRequestedPermission.current = true;
      requestNotificationPermission();
    }
  }, []);

  // Check the loaded data whenever it changes (including the initial load)
  useEffect(() => {
    if (notificationsEnabled && outageData.today.length > 0) {
      notifyNewOutages(outageData, previousOutagesRef);
    }
  }, [outageData, notificationsEnabled]);

  // Poll for fresh data every hour while notifications are on
  useEffect(() => {
    if (!notificationsEnabled) return;
    if (readSavedLocations().length === 0) return;

    const pollForNewOutages = async () => {
      try {
        const response = await fetch("/api", { cache: "no-store" });
        if (response.ok) {
          const result = await response.json();
          notifyNewOutages(result.data as Data, previousOutagesRef);
        }
      } catch (error) {
        console.error("Error polling for outages:", error);
      }
    };

    const interval = setInterval(pollForNewOutages, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [notificationsEnabled]);

  return {
    notificationsEnabled,
    requestNotificationPermission,
  };
};
