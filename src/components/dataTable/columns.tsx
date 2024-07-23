"use client";

import { OutageItem } from "@/app/types";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, BatteryCharging, BatteryWarning } from "lucide-react";
import { Button } from "@/components/ui/button";

export const columns: ColumnDef<OutageItem>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
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
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
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

      return Date.now() > Date.parse(data.from.toString()) &&
        Date.now() < Date.parse(data.to.toString()) ? (
        <BatteryWarning className="text-red-600" width={16} height={16} />
      ) : (
        <BatteryCharging className="text-green-600" width={16} height={16} />
      );
    },
  },
];
