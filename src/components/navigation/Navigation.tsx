import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Zap } from "lucide-react";
import { useTheme } from "next-themes";

const Navigation = () => {
  const { setTheme } = useTheme();

  return (
    <nav className="mb-12 grid w-full grid-cols-3 items-center justify-start gap-8 border-b pb-4 pt-8">
      <div className="flex items-center gap-4 px-4 font-semibold">
        <Zap /> zap
      </div>

      <div className="w-full text-center">
        <a
          href="#outage_list"
          className="scroll-smooth rounded-lg bg-yellow-300 px-4 py-2 text-sm font-semibold text-black"
        >
          View all outages
        </a>
      </div>

      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              className="text-yellow-300 dark:bg-yellow-300 dark:text-black"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
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
  );
};

export default Navigation;
