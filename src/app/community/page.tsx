import type { Metadata } from "next";

import CommunityScene from "@/components/community/CommunityScene";
import { HOUSES } from "@/components/community/houses";
import Footer from "@/components/footer/Footer";
import Navigation from "@/components/navigation/Navigation";
import Window from "@/components/window/Window";
import { getOutages } from "@/lib/outages";

// Rebuilt in the background at most every 5 minutes, like the home page.
export const revalidate = 300;

async function loadOutages() {
  try {
    const { today, future } = await getOutages();
    return [...today, ...future];
  } catch (error) {
    console.error(error);
    return null;
  }
}

export const metadata: Metadata = {
  title: "Community | ZAP",
  description: `A 3D map of Mauritius with ${HOUSES.length} white houses placed where they are on the island.`,
};

export default async function CommunityPage() {
  const outages = await loadOutages();
  return (
    <div className="min-h-screen bg-dot-field">
      <main className="relative mx-auto min-h-screen max-w-7xl px-4 md:px-8 lg:px-12">
        <Navigation />

        <h1 className="mb-4 font-mono text-sm tracking-wider text-window-muted uppercase">
          {"// Community"}
        </h1>

        <p className="mb-8 max-w-2xl text-lg">
          {HOUSES.length} houses across Mauritius, each in its own town. A power
          line runs to every house: moving lime pulses mean it has power, and a
          red line means a planned outage is on there right now.
        </p>

        <Window
          as="section"
          tone="accent"
          title="Mauritius"
          meta={`${HOUSES.length} houses`}
        >
          <CommunityScene outages={outages} />
        </Window>

        <Footer />
      </main>
    </div>
  );
}
