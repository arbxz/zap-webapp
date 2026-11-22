"use client";

import { Bell, BellOff, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";

const bannerClass =
  "mb-6 flex items-center gap-3 border border-window-border bg-window p-4 text-sm";
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
      <div role="status" className={bannerClass}>
        <BellOff aria-hidden="true" className="h-5 w-5 text-danger-text" />
        <div className="flex-1">
          <p className="font-bold text-danger-text">Notifications blocked</p>
          <p className="text-window-muted">
            Turn them on in your browser settings to get outage alerts.
          </p>
        </div>
      </div>
    );
  }

  if (notificationStatus === "granted") {
    return (
      <div role="status" className={bannerClass}>
        <BellRing aria-hidden="true" className="h-5 w-5 text-success-text" />
        <div className="flex-1">
          <p className="font-bold text-success-text">Notifications enabled</p>
          <p className="text-window-muted">
            You&apos;ll receive alerts when outages are detected in your saved
            locations.
          </p>
        </div>
      </div>
    );
  }

  if (showBanner) {
    return (
      <div className={bannerClass}>
        <Bell aria-hidden="true" className="h-5 w-5 text-arbxz-accent-text" />
        <div className="flex-1">
          <p className="font-bold">Get notified about power outages</p>
          <p className="text-window-muted">
            Enable notifications to receive alerts when outages are detected in
            your saved locations.
          </p>
        </div>
        <Button onClick={handleEnableNotifications} size="sm">
          Enable
        </Button>
      </div>
    );
  }

  return null;
};
