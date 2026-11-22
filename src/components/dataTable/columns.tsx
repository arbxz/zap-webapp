"use client";

import { OutageItem } from "@/app/types";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, BatteryCharging, BatteryWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Features } from "./features";

export const columns: ColumnDef<Features, OutageItem, unknown>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "locality",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Locality
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "streets",
    header: "Streets",
  },
  {
    id: "actions",
    header: "Power",
    cell: ({ row }) => {
      const data = row.original;

      // Icon plus a word, so the state never rests on colour alone.
      return Date.now() > Date.parse(data.from.toString()) &&
        Date.now() < Date.parse(data.to.toString()) ? (
        <span className="flex items-center gap-2 font-mono text-xs font-bold whitespace-nowrap text-danger-text uppercase">
          <BatteryWarning aria-hidden="true" width={16} height={16} />
          Off now
        </span>
      ) : (
        <span className="flex items-center gap-2 font-mono text-xs whitespace-nowrap text-window-muted uppercase">
          <BatteryCharging aria-hidden="true" width={16} height={16} />
          Scheduled
        </span>
      );
    },
  },
];
