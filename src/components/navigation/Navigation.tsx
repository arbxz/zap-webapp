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
    <nav className="mb-12 flex w-full grid-cols-3 items-center justify-start gap-2 border-b pt-8 pb-4 md:grid md:gap-8">
      <div className="flex items-center gap-4 px-4 font-semibold">
        <Zap /> <span className="hidden md:inline-block">zap</span>
      </div>

      <div className="w-full text-center">
        <a
          href="#outage_list"
          className="scroll-smooth rounded-lg bg-yellow-300 px-4 py-2 text-sm font-medium text-stone-900"
        >
          All outages
        </a>
      </div>

      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant={"secondary"}>
              <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
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
