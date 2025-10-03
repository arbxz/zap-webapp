import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

const TableSkeleton = () => {
  return (
    <>
      <TableRow>
        <TableCell className="w-[200px]">
          <Skeleton className="h-[20px] rounded-full" />
        </TableCell>
        <TableCell className="w-[100px]">
          <Skeleton className="h-[20px] rounded-full" />
        </TableCell>
        <TableCell className="w-[200px]">
          <Skeleton className="h-[20px] rounded-full" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-[20px] rounded-full" />
        </TableCell>
        <TableCell className="text-right">
          <Skeleton className="h-[20px] rounded-full" />
        </TableCell>
        <TableCell className="text-right">
          <Skeleton className="h-[20px] rounded-full" />
        </TableCell>
        <TableCell className="text-right">
          <Skeleton className="h-[20px] w-[30px] rounded-full" />
        </TableCell>
      </TableRow>
    </>
  );
};

export default TableSkeleton;
