"use client";

import { Bell, BellOff, BellRing } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface NotificationBannerProps {
  onEnableNotifications: () => Promise<boolean>;
}

export const NotificationBanner = ({
  onEnableNotifications,
}: NotificationBannerProps) => {
  const [notificationStatus, setNotificationStatus] = useState<
    "granted" | "denied" | "default" | "unsupported"
  >("default");
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotificationStatus("unsupported");
      return;
    }

    setNotificationStatus(
      Notification.permission as "granted" | "denied" | "default",
    );

    // Show banner if user has saved locations but hasn't granted permission
    const checkSavedLocations = () => {
      const stored = localStorage.getItem("savedLocations");
      const locations = stored ? JSON.parse(stored) : [];
      setShowBanner(
        locations.length > 0 && Notification.permission === "default",
      );
    };

    checkSavedLocations();

    // Listen for storage changes
    window.addEventListener("storage", checkSavedLocations);
    return () => window.removeEventListener("storage", checkSavedLocations);
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await onEnableNotifications();
    if (granted) {
      setNotificationStatus("granted");
      setShowBanner(false);
    } else {
      setNotificationStatus("denied");
    }
  };

  if (notificationStatus === "unsupported") {
    return null;
  }

  if (notificationStatus === "denied") {
    return (
      <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm">
        <BellOff className="h-5 w-5 text-red-500" />
        <div className="flex-1">
          <p className="font-medium text-red-700 dark:text-red-400">
            Notifications blocked
          </p>
          <p className="text-red-600/80 dark:text-red-300/80">
            Please enable notifications in your browser settings to receive
            outage alerts.
          </p>
        </div>
      </div>
    );
  }

  if (notificationStatus === "granted") {
    return (
      <div className="mb-4 flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm">
        <BellRing className="h-5 w-5 text-green-600 dark:text-green-400" />
        <div className="flex-1">
          <p className="font-medium text-green-700 dark:text-green-400">
            Notifications enabled
          </p>
          <p className="text-green-600/80 dark:text-green-300/80">
            You&apos;ll receive alerts when outages are detected in your saved
            locations.
          </p>
        </div>
      </div>
    );
  }

  if (showBanner) {
    return (
      <div className="mb-4 flex items-center gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm">
        <Bell className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        <div className="flex-1">
          <p className="font-medium text-yellow-700 dark:text-yellow-400">
            Get notified about power outages
          </p>
          <p className="text-yellow-600/80 dark:text-yellow-300/80">
            Enable notifications to receive alerts when outages are detected in
            your saved locations.
          </p>
        </div>
        <Button
          onClick={handleEnableNotifications}
          size="sm"
          className="bg-yellow-500 hover:bg-yellow-600"
        >
          Enable
        </Button>
      </div>
    );
  }

  return null;
};
