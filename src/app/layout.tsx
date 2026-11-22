import type { Metadata } from "next";
import { JetBrains_Mono, Source_Sans_3 } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "./provider/theme-provider";

// Same pair as arbxz: Source Sans 3 for text, JetBrains Mono for UI labels
// and window chrome.
const sans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-source-sans",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "ZAP",
  description: "ZAP is a simple app to display power outages in Mauritius",
  applicationName: "ZAP",
  authors: [{ url: "https://www.arbxz.dev", name: "Arbaaz Mowlabucus" }],
  generator: "Power outage data",
  keywords: [
    "power",
    "outage",
    "electricity",
    "mauritius",
    "arbaaz mowlabucus",
    "nextjs",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
