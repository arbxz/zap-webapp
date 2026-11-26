"use client";

import { useMemo, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { Data } from "@/app/types";
import { BarchartLabel } from "@/components/barchartLabel/BarChartLabel";
import Navigation from "@/components/navigation/Navigation";
import Footer from "@/components/footer/Footer";
import { SunDim } from "lucide-react";
import { useOutageNotifications } from "@/hooks/useOutageNotifications";
import { NotificationBanner } from "@/components/notificationBanner/NotificationBanner";
import Window from "@/components/window/Window";
import Link from "next/link";

// The parts below the fold still render on the server, so the HTML and layout
// don't change. As separate chunks behind their own Suspense boundaries, React
// hydrates each in its own task instead of one long one that blocks input on
// slow phones.
const CommunityScene = dynamic(
  () => import("@/components/community/CommunityScene"),
);
const LocationMonitor = dynamic(
  () => import("@/components/locationMonitor/LocationMonitor"),
);
const OutageTable = dynamic(
  () => import("@/components/outageTable/OutageTable"),
);

// The page is prerendered at build time, so a server-rendered clock showed
// the build time and never matched the client (React error #418). The server
// snapshot is null; the client reads the time on hydration and every second.
const subscribeToClock = (onTick: () => void) => {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
};
const getClockSnapshot = () => Math.floor(Date.now() / 1000) * 1000;
const getServerClockSnapshot = () => null;

/**
 * The time and date in the overview row. It has its own component so the
 * re-render after hydration, and the one every second after that, touch
 * these two lines and not the table, chart and map below.
 */
function OverviewClock() {
  const now = useSyncExternalStore(
    subscribeToClock,
    getClockSnapshot,
    getServerClockSnapshot,
  );
  const currentTime = now === null ? null : new Date(now);

  return (
    <>
      <p className="flex items-baseline gap-2">
        <span className="text-xl font-bold text-foreground">
          {currentTime?.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }) ?? "--:--"}
        </span>
        <span className="text-xs text-window-muted">time</span>
      </p>

      <p className="text-window-muted">
        {currentTime?.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
        }) ?? ""}
      </p>
    </>
  );
}

interface OutageDashboardProps {
  initialData: Data;
  /** True when the server could not reach the dataset. */
  loadFailed: boolean;
}

export default function OutageDashboard({
  initialData,
  loadFailed,
}: OutageDashboardProps) {
  // The server already fetched the data; nothing loads after hydration.
  const outageData = initialData;
  const allOutages = useMemo(
    () => [...outageData.today, ...outageData.future],
    [outageData],
  );

  // Enable outage notifications
  const { requestNotificationPermission } = useOutageNotifications(outageData);

  return (
    <div className="min-h-screen bg-dot-field">
      <main className="relative mx-auto min-h-screen max-w-7xl px-4 md:px-8 lg:px-12">
        <Navigation />

        <NotificationBanner
          onEnableNotifications={requestNotificationPermission}
        />

        {loadFailed && (
          <p
            role="alert"
            className="mb-6 border border-window-border bg-window p-4 text-sm font-bold text-danger-text"
          >
            Outage data couldn&apos;t be loaded. Try again in a few minutes.
          </p>
        )}

        <div className="mb-8 flex w-full flex-wrap items-baseline justify-between gap-4 font-mono text-sm uppercase">
          <h1 className="tracking-wider text-window-muted">{"// Overview"}</h1>

          <OverviewClock />
        </div>

        <div className="mb-4 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
          <Window
            title="zap.app"
            tone="accent"
            className="crop-marks shadow-lg"
            bodyClassName="flex h-full flex-col justify-end gap-4 p-6 md:p-8"
          >
            <p className="font-mono text-xs tracking-wider text-window-muted uppercase">
              {"// Live outage map"}
            </p>
            <h2 className="text-3xl font-bold md:text-4xl">
              Monitor power outages live in Mauritius
              <span className="text-arbxz-accent-text">.</span>
            </h2>
          </Window>

          <Window
            title="tip.txt"
            bodyClassName="flex h-full flex-col justify-between gap-6 p-6"
          >
            <SunDim
              size={48}
              aria-hidden="true"
              className="text-arbxz-accent-text"
            />
            <p className="text-2xl">
              You can always go green and get off the grid with{" "}
              <mark className="bg-accent-2 px-1 font-bold text-ink">
                solar energy
              </mark>
              .
            </p>
          </Window>

          <BarchartLabel data={outageData} />
        </div>

        {/* The map the hero promises: island-wide power at a glance, before
            the saved locations and the full outage list. */}
        <Window
          as="section"
          title="map.3d"
          meta={
            <Link
              href="/community"
              className="-my-1 inline-flex min-h-6 items-center px-1 underline underline-offset-4 hover:no-underline"
            >
              Full view
            </Link>
          }
          className="mt-6"
        >
          <CommunityScene outages={loadFailed ? null : allOutages} />
        </Window>

        <LocationMonitor outageData={outageData} />

        <section id="outage_list" aria-label="All outages" className="w-full">
          <OutageTable data={outageData} />
        </section>

        <Footer />
      </main>
    </div>
  );
}
