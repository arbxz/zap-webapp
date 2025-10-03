import SavedLocationType from "@/types";
import { HomeIcon, Briefcase, Building } from "lucide-react";

export const LocationTypeIcons = {
  home: {
    icon: HomeIcon,
    label: SavedLocationType.HOME,
  },
  work: {
    icon: Briefcase,
    label: SavedLocationType.WORK,
  },
  other: {
    icon: Building,
    label: SavedLocationType.OTHER,
  },
};
