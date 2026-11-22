"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ColumnDef,
  SortingState,
  flexRender,
  ColumnFiltersState,
  RowData,
  useTable,
} from "@tanstack/react-table";
import { Features, features } from "./features";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Below md the table turns into one card per row, so each cell carries its
// own label there; the header row (and its sort buttons) is hidden.
const columnLabel = (id: string) =>
  id === "actions" ? "Power" : id.charAt(0).toUpperCase() + id.slice(1);

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<Features, TData, unknown>[];
  data: TData[];
  /** Extra filters shown next to the locality search. */
  toolbar?: React.ReactNode;
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  toolbar,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const table = useTable({
    features,
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 py-4">
        <Input
          placeholder="Filter localities"
          aria-label="Filter localities"
          value={
            (table.getColumn("locality")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("locality")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        {toolbar}
      </div>
      <div className="overflow-x-auto border border-window-border bg-window">
        <Table className="max-md:block">
          <TableHeader className="max-md:hidden">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="max-md:block">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="max-md:grid max-md:grid-cols-[5.5rem_1fr] max-md:items-baseline max-md:gap-x-3 max-md:gap-y-2 max-md:p-4"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="max-md:contents">
                      <span className="font-mono text-xs tracking-wider text-window-muted uppercase md:hidden">
                        {columnLabel(cell.column.id)}
                      </span>
                      <div>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="max-md:block">
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center max-md:flex max-md:items-center max-md:justify-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
