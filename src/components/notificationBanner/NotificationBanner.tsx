"use client";

import { Bell, BellOff, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  notifyPermissionChanged,
  useNotificationPermission,
  useSavedLocations,
} from "@/lib/browserState";

interface NotificationBannerProps {
  onEnableNotifications: () => Promise<boolean>;
}

export const NotificationBanner = ({
  onEnableNotifications,
}: NotificationBannerProps) => {
  // Both values are read from the browser through a subscription instead of
  // being copied into state by a mount effect.
  const notificationStatus = useNotificationPermission();
  const savedLocations = useSavedLocations();

  // Prompt only once the user has something worth being notified about.
  const showBanner =
    savedLocations.length > 0 && notificationStatus === "default";

  const handleEnableNotifications = async () => {
    await onEnableNotifications();
    // Notification.permission has no change event; announce it so every
    // subscriber re-reads the real value rather than a local guess.
    notifyPermissionChanged();
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
