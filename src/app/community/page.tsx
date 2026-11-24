import type { Metadata } from "next";

import CommunityScene from "@/components/community/CommunityScene";
import { HOUSES, STREET_NAME } from "@/components/community/houses";
import Footer from "@/components/footer/Footer";
import Navigation from "@/components/navigation/Navigation";
import Window from "@/components/window/Window";

export const metadata: Metadata = {
  title: "Community | ZAP",
  description: `A 3D view of ${HOUSES.length} white houses on ${STREET_NAME}.`,
};

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-dot-field">
      <main className="relative mx-auto min-h-screen max-w-7xl px-4 md:px-8 lg:px-12">
        <Navigation />

        <h1 className="mb-8 font-mono text-sm tracking-wider text-window-muted uppercase">
          {"// Community"}
        </h1>

        <Window
          as="section"
          tone="accent"
          title={STREET_NAME}
          meta={`${HOUSES.length} houses`}
        >
          <CommunityScene />
        </Window>

        <Footer />
      </main>
    </div>
  );
}
