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
import { useTheme } from "next-themes";

import type { OutageItem } from "@/app/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { CommunityScene as SceneHandle } from "./buildScene";
import { HOUSES, houseDetails, type ScreenPoint } from "./houses";
import { powerStatus, type PowerStatus } from "./power";
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
  const power = useMemo(
    () =>
      now === null
        ? null
        : HOUSES.map((house) => powerStatus(house, outages, new Date(now))),
    [outages, now],
  );
  const dark = resolvedTheme === "dark";
  const rotating = !reducedMotion && spinning;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let cancelled = false;

    const placeLabels = (points: ScreenPoint[]) => {
      points.forEach((point, i) => {
        const label = labelRefs.current[i];
        if (!label) return;
        // Keep the whole label inside the stage, even for a house at the edge.
        const half = label.offsetWidth / 2;
        const x = Math.min(Math.max(point.x, half), stage.clientWidth - half);
        // 8px gap under the anchor, and no lower than the stage's bottom edge.
        const y = Math.min(
          point.y + 8,
          stage.clientHeight - label.offsetHeight,
        );
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
            houses: HOUSES,
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

  useEffect(() => {
    if (power) sceneRef.current?.setPower(power);
  }, [power, status]);

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
            here, so here are the houses as a list.
          </p>
        )}

        <ul
          aria-label="Houses on the map"
          className={cn(
            failed
              ? "grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3"
              : "pointer-events-none absolute inset-0",
          )}
        >
          {HOUSES.map((house, i) => (
            <li
              key={house.id}
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
                {house.name}
              </p>
              <p className="text-xs">{house.locality}</p>
              {power && <PowerLine status={power[i]} />}
              {/* Phones show name and town only, so six labels fit; the rest stays readable by screen readers. */}
              <p
                className={cn(
                  "text-xs text-window-muted",
                  !failed && "sr-only sm:not-sr-only",
                )}
              >
                {houseDetails(house)}
              </p>
            </li>
          ))}
        </ul>
      </div>

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
