import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "./provider/theme-provider";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
