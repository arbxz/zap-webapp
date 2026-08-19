"use client";

import { useSyncExternalStore } from "react";

export interface SavedLocation {
  district: string;
  locality: string;
  type: string;
}

export type NotificationPermissionState =
  | "granted"
  | "denied"
  | "default"
  | "unsupported";

const STORAGE_KEY = "savedLocations";
const LOCATIONS_EVENT = "zap:saved-locations-changed";
const PERMISSION_EVENT = "zap:notification-permission-changed";

/**
 * Browser state read through useSyncExternalStore rather than copied into
 * component state by an effect.
 *
 * Reading it in an effect and calling setState meant a render pass with the
 * wrong value followed by a second pass to correct it, which is what
 * react-hooks/set-state-in-effect flags. It also left each consumer with its
 * own snapshot: the `storage` event only fires in *other* tabs, so adding a
 * location did not refresh the banner or the monitor in the tab that added it.
 * The writers below dispatch a same-tab event so every subscriber updates.
 */

// getSnapshot must return a referentially stable value or React re-renders
// forever, so the parsed array is cached against the raw string it came from.
let cachedRaw: string | null = null;
let cachedLocations: SavedLocation[] = [];

const EMPTY_LOCATIONS: SavedLocation[] = [];

function getSavedLocationsSnapshot(): SavedLocation[] {
  if (typeof window === "undefined") return EMPTY_LOCATIONS;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedLocations;

  cachedRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cachedLocations = Array.isArray(parsed)
      ? (parsed as SavedLocation[])
      : EMPTY_LOCATIONS;
  } catch {
    // A corrupt entry should not take the page down
    cachedLocations = EMPTY_LOCATIONS;
  }
  return cachedLocations;
}

function getServerLocationsSnapshot(): SavedLocation[] {
  return EMPTY_LOCATIONS;
}

function subscribeToLocations(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(LOCATIONS_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(LOCATIONS_EVENT, onStoreChange);
  };
}

/** Saved locations, kept in sync across components and tabs. */
export function useSavedLocations(): SavedLocation[] {
  return useSyncExternalStore(
    subscribeToLocations,
    getSavedLocationsSnapshot,
    getServerLocationsSnapshot,
  );
}

/** Persist saved locations and notify every subscriber in this tab. */
export function writeSavedLocations(next: SavedLocation[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(LOCATIONS_EVENT));
}

/** Read saved locations outside React, for use inside callbacks and timers. */
export function readSavedLocations(): SavedLocation[] {
  return getSavedLocationsSnapshot();
}

function getPermissionSnapshot(): NotificationPermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission as NotificationPermissionState;
}

function getServerPermissionSnapshot(): NotificationPermissionState {
  return "default";
}

function subscribeToPermission(onStoreChange: () => void): () => void {
  window.addEventListener(PERMISSION_EVENT, onStoreChange);
  return () => window.removeEventListener(PERMISSION_EVENT, onStoreChange);
}

/**
 * Current Notification permission. The browser gives no change event for this,
 * so callers that invoke requestPermission() announce the result themselves
 * via notifyPermissionChanged().
 */
export function useNotificationPermission(): NotificationPermissionState {
  return useSyncExternalStore(
    subscribeToPermission,
    getPermissionSnapshot,
    getServerPermissionSnapshot,
  );
}

/** Announce that Notification.permission has changed. */
export function notifyPermissionChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PERMISSION_EVENT));
}
