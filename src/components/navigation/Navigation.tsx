"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";

const Navigation = () => {
  const { setTheme } = useTheme();

  return (
    <header className="pt-4 pb-8 md:pt-6">
      <nav
        aria-label="Main"
        className="flex w-full items-center gap-3 border border-window-border px-4 py-3 shadow-xs glass"
      >
        <Link href="/" className="flex shrink-0 items-center">
          <span className="bg-window-title px-3 py-1 font-mono text-xs font-bold tracking-wider text-window-title-fg uppercase">
            Zap
          </span>
          <span className="sr-only">Zap home</span>
        </Link>

        <div className="mx-auto flex items-center gap-2">
          <Link
            href="/#outage_list"
            className="inline-flex min-h-10 items-center bg-accent-2 px-3 font-mono text-xs font-bold tracking-wider whitespace-nowrap text-ink uppercase transition-transform active:scale-95 sm:px-4"
          >
            All outages
          </Link>
          <Link
            href="/community"
            className="inline-flex min-h-10 items-center border border-window-border px-3 font-mono text-xs font-bold tracking-wider whitespace-nowrap uppercase transition-transform active:scale-95 sm:px-4"
          >
            Community
          </Link>
        </div>

        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant={"secondary"}>
                <Sun
                  aria-hidden="true"
                  className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
                />
                <Moon
                  aria-hidden="true"
                  className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
                />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
};

export default Navigation;
