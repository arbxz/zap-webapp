"use client";

import { useEffect, useRef } from "react";
import { Data, OutageItem } from "@/app/types";
import {
  notifyPermissionChanged,
  readSavedLocations,
  useNotificationPermission,
  type SavedLocation,
} from "@/lib/browserState";

export const useOutageNotifications = (outageData: Data) => {
  // Derived from the browser rather than mirrored into state by a mount effect,
  // which rendered `false` once before correcting itself.
  const notificationsEnabled = useNotificationPermission() === "granted";
  const previousOutagesRef = useRef<OutageItem[]>([]);
  const hasRequestedPermission = useRef(false);

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
  const showOutageNotification = (
    outage: OutageItem,
    location: SavedLocation,
  ) => {
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

  // Check for new outages in saved locations
  const checkForNewOutages = () => {
    const savedLocations = readSavedLocations();
    if (savedLocations.length === 0) return;

    // Combine today and future outages
    const allCurrentOutages = [...outageData.today, ...outageData.future];
    const previousOutages = previousOutagesRef.current;

    // Find outages in saved locations
    const relevantOutages = allCurrentOutages.filter((outage) =>
      savedLocations.some((loc) => loc.locality === outage.locality),
    );

    // Find new outages (not in previous check)
    const newOutages = relevantOutages.filter(
      (outage) =>
        !previousOutages.some((prevOutage) => prevOutage.id === outage.id),
    );

    // Show notifications for new outages
    newOutages.forEach((outage) => {
      const location = savedLocations.find(
        (loc) => loc.locality === outage.locality,
      );
      if (location) {
        showOutageNotification(outage, location);
      }
    });

    // Update previous outages
    previousOutagesRef.current = relevantOutages;
  };

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

  // Check for outages when data changes (initial load)
  useEffect(() => {
    if (notificationsEnabled && outageData.today.length > 0) {
      checkForNewOutages();
    }
  }, [outageData, notificationsEnabled]);

  // Poll for new outages every 5 minutes
  useEffect(() => {
    if (!notificationsEnabled) return;

    const savedLocations = readSavedLocations();
    if (savedLocations.length === 0) return;

    // Initial check with current data
    checkForNewOutages();

    // Fetch fresh data and check for new outages
    const pollForNewOutages = async () => {
      try {
        const response = await fetch("/api", { cache: "no-store" });
        if (response.ok) {
          const result = await response.json();
          const freshData: Data = result.data;

          // Check for new outages with fresh data
          const allCurrentOutages = [...freshData.today, ...freshData.future];
          const previousOutages = previousOutagesRef.current;
          const savedLocs = readSavedLocations();

          // Find outages in saved locations
          const relevantOutages = allCurrentOutages.filter((outage) =>
            savedLocs.some((loc) => loc.locality === outage.locality),
          );

          // Find new outages (not in previous check)
          const newOutages = relevantOutages.filter(
            (outage) =>
              !previousOutages.some(
                (prevOutage) => prevOutage.id === outage.id,
              ),
          );

          // Show notifications for new outages
          newOutages.forEach((outage) => {
            const location = savedLocs.find(
              (loc) => loc.locality === outage.locality,
            );
            if (location) {
              showOutageNotification(outage, location);
            }
          });

          // Update previous outages
          previousOutagesRef.current = relevantOutages;
        }
      } catch (error) {
        console.error("Error polling for outages:", error);
      }
    };

    // Set up polling interval (1 hour)
    const interval = setInterval(pollForNewOutages, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [notificationsEnabled]);

  return {
    notificationsEnabled,
    requestNotificationPermission,
  };
};
