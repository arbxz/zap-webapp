"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Pause, Play, RotateCcw, RotateCw } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { CommunityScene as SceneHandle } from "./buildScene";
import { HOUSES, houseDetails, type ScreenPoint } from "./houses";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const subscribeToMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const getMotionSnapshot = () => window.matchMedia(REDUCED_MOTION).matches;
// The server can't know; assume reduced so nothing spins before hydration.
const getServerMotionSnapshot = () => true;

/** One button press turns the view 22.5 degrees. */
const TURN_STEP = Math.PI / 8;

type Status = "loading" | "ready" | "failed";

export default function CommunityScene() {
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
  const dark = resolvedTheme === "dark";
  const rotating = !reducedMotion && spinning;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let cancelled = false;
    let observer: IntersectionObserver | undefined;

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

    // three.js loads only on this page and only after the HTML is up.
    import("./buildScene")
      .then(({ createCommunityScene }) => {
        if (cancelled) return;
        const scene = createCommunityScene(stage, {
          houses: HOUSES,
          dark: false,
          autoRotate: false,
          onFrame: placeLabels,
        });
        sceneRef.current = scene;
        observer = new IntersectionObserver(([entry]) =>
          scene.setRunning(entry.isIntersecting),
        );
        observer.observe(stage);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        // No WebGL (old device, disabled GPU) or the chunk failed to load.
        console.error(error);
        if (!cancelled) setStatus("failed");
      });

    return () => {
      cancelled = true;
      observer?.disconnect();
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
            Your browser couldn&apos;t draw the 3D map, so here are the houses
            as a list.
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
