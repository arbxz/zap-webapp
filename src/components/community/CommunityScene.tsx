"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  CircleHelp,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Zap,
  ZapOff,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";

import type { OutageItem } from "@/app/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useSavedLocations } from "@/lib/browserState";

import type { CommunityScene as SceneHandle } from "./buildScene";
import type { ScreenPoint } from "./geo";
import { DISTRICT_NAMES, displayLocality, placeSavedLocations } from "./places";
import { nextOutage, powerStatus, type PowerStatus } from "./power";
import { hasFastWebGL } from "./webgl";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const subscribeToMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const getMotionSnapshot = () => window.matchMedia(REDUCED_MOTION).matches;
// The server can't know; assume reduced so nothing spins before hydration.
const getServerMotionSnapshot = () => true;

// Power status follows the clock: an outage starts or ends on the minute.
// The server snapshot is null so the prerendered HTML never claims a status
// for the build time.
const subscribeToMinute = (onTick: () => void) => {
  const id = setInterval(onTick, 30_000);
  return () => clearInterval(id);
};
const getMinuteSnapshot = () => Math.floor(Date.now() / 60_000) * 60_000;
const getServerMinuteSnapshot = () => null;

const timeFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Indian/Mauritius",
});
const dayFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "Indian/Mauritius",
});

/** Gap kept between labels that would otherwise overlap, in pixels. */
const LABEL_GAP = 4;

function PowerLine({ status }: { status: PowerStatus }) {
  if (status.state === "on") {
    return (
      <p className="flex items-center justify-center gap-1 text-xs font-bold text-success-text sm:justify-start">
        <Zap aria-hidden="true" className="size-3.5" />
        Power on
      </p>
    );
  }
  if (status.state === "off") {
    return (
      <p className="flex items-center justify-center gap-1 text-xs font-bold text-danger-text sm:justify-start">
        <ZapOff aria-hidden="true" className="size-3.5" />
        Power off until {timeFormat.format(status.until)}
      </p>
    );
  }
  return (
    <p className="flex items-center justify-center gap-1 text-xs text-window-muted sm:justify-start">
      <CircleHelp aria-hidden="true" className="size-3.5" />
      Power status unknown
    </p>
  );
}

/** One button press turns the view 22.5 degrees. */
const TURN_STEP = Math.PI / 8;

type Status = "loading" | "ready" | "failed";

interface CommunitySceneProps {
  /** Today's and upcoming planned outages, or null if they couldn't load. */
  outages: OutageItem[] | null;
}

export default function CommunityScene({ outages }: CommunitySceneProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLLIElement | null)[]>([]);
  const sceneRef = useRef<SceneHandle | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [spinning, setSpinning] = useState(false);

  const savedLocations = useSavedLocations();
  const { places, offMap } = useMemo(
    () => placeSavedLocations(savedLocations),
    [savedLocations],
  );

  const { resolvedTheme } = useTheme();
  const reducedMotion = useSyncExternalStore(
    subscribeToMotion,
    getMotionSnapshot,
    getServerMotionSnapshot,
  );
  const now = useSyncExternalStore(
    subscribeToMinute,
    getMinuteSnapshot,
    getServerMinuteSnapshot,
  );
  // Saved places live in this browser, so the server renders none. `now` is
  // null until hydration, which also tells us whether "no places yet" is
  // true or just the server's view.
  const hydrated = now !== null;
  const power = useMemo(
    () =>
      now === null
        ? null
        : places.map((place) => ({
            status: powerStatus(place, outages, new Date(now)),
            next: nextOutage(place, outages, new Date(now)),
          })),
    [places, outages, now],
  );
  const dark = resolvedTheme === "dark";
  const rotating = !reducedMotion && spinning;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let cancelled = false;

    const placeLabels = (points: ScreenPoint[]) => {
      // Top to bottom, each label moves down until it clears the ones
      // already placed, so two saved places close together stay readable.
      const placed: {
        left: number;
        right: number;
        top: number;
        bottom: number;
      }[] = [];
      points
        .map((point, i) => ({ point, label: labelRefs.current[i] }))
        .sort((a, b) => a.point.y - b.point.y)
        .forEach(({ point, label }) => {
          if (!label) return;
          const width = label.offsetWidth;
          const height = label.offsetHeight;
          // Keep the whole label inside the stage, even for a house at the edge.
          const half = width / 2;
          const x = Math.min(Math.max(point.x, half), stage.clientWidth - half);
          let y = point.y + 8;
          for (const other of placed) {
            const overlaps =
              x - half < other.right + LABEL_GAP &&
              x + half > other.left - LABEL_GAP &&
              y < other.bottom + LABEL_GAP &&
              y + height > other.top - LABEL_GAP;
            if (overlaps) y = other.bottom + LABEL_GAP;
          }
          // No lower than the stage's bottom edge.
          y = Math.min(y, stage.clientHeight - height);
          placed.push({
            left: x - half,
            right: x + half,
            top: y,
            bottom: y + height,
          });
          label.style.transform = `translate(${x}px, ${y}px) translateX(-50%)`;
          label.style.opacity = point.visible ? "1" : "0";
        });
    };

    // three.js (and the WebGL context) load only once the stage is within
    // 300px of the viewport, so a page that shows the map below the fold
    // doesn't pay for it on first load. After that the same observer pauses
    // rendering whenever the map scrolls out of view.
    let loading = false;
    let visible = false;
    const load = () => {
      loading = true;
      hasFastWebGL()
        // Without a GPU, three.js never loads and the list shows instead.
        .then((fast) => (fast ? import("./buildScene") : null))
        .then((module) => {
          if (cancelled) return;
          if (!module) {
            setStatus("failed");
            return;
          }
          const { createCommunityScene } = module;
          sceneRef.current = createCommunityScene(stage, {
            dark: false,
            autoRotate: false,
            powerMotion: false,
            onFrame: placeLabels,
          });
          // The map may have scrolled away while three.js was loading.
          sceneRef.current.setRunning(visible);
          setStatus("ready");
        })
        .catch((error: unknown) => {
          // The chunk failed to load, or WebGL broke despite the check.
          console.error(error);
          if (!cancelled) setStatus("failed");
        });
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !loading) load();
        sceneRef.current?.setRunning(visible);
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(stage);

    return () => {
      cancelled = true;
      observer.disconnect();
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    sceneRef.current?.setDark(dark);
  }, [dark, status]);

  useEffect(() => {
    sceneRef.current?.setAutoRotate(rotating);
  }, [rotating, status]);

  useEffect(() => {
    sceneRef.current?.setPowerMotion(!reducedMotion);
  }, [reducedMotion, status]);

  // Rebuild the houses when the saved places change, then colour their lines.
  useEffect(() => {
    sceneRef.current?.setPlaces(places);
  }, [places, status]);

  useEffect(() => {
    if (power) sceneRef.current?.setPower(power.map((p) => p.status));
  }, [power, places, status]);

  const failed = status === "failed";

  return (
    <div>
      <div
        ref={stageRef}
        className={cn(
          "relative h-[520px] overflow-hidden md:h-[600px]",
          failed && "h-auto md:h-auto",
        )}
      >
        {status === "loading" && (
          <p
            role="status"
            className="absolute inset-0 grid place-items-center font-mono text-xs text-window-muted uppercase"
          >
            Loading the map…
          </p>
        )}
        {failed && (
          <p role="alert" className="p-4 text-sm text-window-muted">
            The 3D map needs graphics acceleration, which isn&apos;t available
            here, so here are your places as a list.
          </p>
        )}

        {hydrated && places.length === 0 && offMap.length === 0 && (
          <div className="absolute inset-x-4 top-4 z-10 mx-auto max-w-sm border border-window-border bg-window p-4 text-center shadow-xs">
            <p className="font-mono text-xs font-bold uppercase">
              No saved places yet
            </p>
            <p className="mt-1 text-sm text-window-muted">
              Save your home or work in{" "}
              <Link
                href="/#saved_locations"
                className="text-arbxz-accent-text underline underline-offset-4 hover:no-underline"
              >
                Saved locations
              </Link>{" "}
              and it shows up here with its power status.
            </p>
          </div>
        )}

        <ul
          aria-label="Your saved places"
          className={cn(
            failed
              ? "grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3"
              : "pointer-events-none absolute inset-0",
          )}
        >
          {places.map((place, i) => {
            const next = power?.[i].next;
            return (
              <li
                key={place.id}
                ref={(node) => {
                  labelRefs.current[i] = node;
                }}
                className={cn(
                  "border border-window-border bg-window px-2 py-1 text-window-fg",
                  !failed &&
                    "absolute top-0 left-0 w-max max-w-[8.5rem] text-center opacity-0 shadow-xs will-change-transform sm:max-w-none sm:text-left sm:whitespace-nowrap",
                )}
              >
                <p className="font-mono text-xs font-bold uppercase">
                  {place.types.join(" · ")}
                </p>
                <p className="text-xs">
                  {place.name}
                  <span className="text-window-muted">
                    , {place.districtName}
                  </span>
                </p>
                {power && <PowerLine status={power[i].status} />}
                {/* Phones keep labels short; the rest stays readable by screen readers. */}
                <div
                  className={cn(
                    "text-xs text-window-muted",
                    !failed && "sr-only sm:not-sr-only",
                  )}
                >
                  {power && (
                    <p>
                      {next
                        ? `Next outage ${dayFormat.format(next.from)}, ${timeFormat.format(next.from)}–${timeFormat.format(next.to)}`
                        : "No planned outages"}
                    </p>
                  )}
                  {place.precision === "district" && (
                    <p>Position approximate (district centre)</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {offMap.length > 0 && (
        <p className="border-t border-window-border px-3 py-2 text-sm text-window-muted">
          Not on this map:{" "}
          {offMap
            .map(
              (location) =>
                `${location.type} in ${displayLocality(location.locality)}, ${DISTRICT_NAMES[location.district] ?? location.district}`,
            )
            .join("; ")}
          . The map shows the main island only.
        </p>
      )}

      {status === "ready" && (
        <div
          role="group"
          aria-label="View controls"
          className="flex flex-wrap items-center gap-2 border-t border-window-border p-3"
        >
          <Button
            variant="secondary"
            className="min-h-11"
            onClick={() => sceneRef.current?.turn(TURN_STEP)}
          >
            <RotateCcw aria-hidden="true" />
            Turn left
          </Button>
          <Button
            variant="secondary"
            className="min-h-11"
            onClick={() => sceneRef.current?.turn(-TURN_STEP)}
          >
            <RotateCw aria-hidden="true" />
            Turn right
          </Button>
          {!reducedMotion && (
            <Button
              variant="secondary"
              className="min-h-11"
              onClick={() => setSpinning((on) => !on)}
            >
              {spinning ? (
                <Pause aria-hidden="true" />
              ) : (
                <Play aria-hidden="true" />
              )}
              {spinning ? "Stop rotating" : "Rotate"}
            </Button>
          )}
          <p className="ml-auto font-mono text-xs text-window-muted uppercase">
            Drag sideways to look around
          </p>
        </div>
      )}
    </div>
  );
}
