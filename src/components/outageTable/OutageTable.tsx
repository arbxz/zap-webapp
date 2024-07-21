"use client";

import { OutageItem } from "@/app/types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TableSkeleton from "../outageSkeletonLoader/OutageSkeletonLoader";
import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

interface OutageTableProps {
  data: any;
  isLoading: boolean;
  selectedRegion: string;
}

const OutageTable = ({ data, isLoading, selectedRegion }: OutageTableProps) => {
  const [todayData, setTodayData] = useState<OutageItem[]>([]);
  const [futureData, setFutureData] = useState<OutageItem[]>([]);

  function formatDate(dateString: string) {
    const date = new Date(dateString);

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // getMonth() is zero-based
    const year = date.getFullYear().toString().substr(-2); // Get last 2 digits of year

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  useEffect(() => {
    const { today } = data;
    const { future } = data;

    setTodayData(today);
    setFutureData(future);
  }, [data]);

  useEffect(() => {
    if (selectedRegion === "") {
      setTodayData(data.today);
      setFutureData(data.future);
    } else {
      const todayData = data.today.filter(
        (item: OutageItem) => item.district === selectedRegion
      );
      const futureData = data.future.filter(
        (item: OutageItem) => item.district === selectedRegion
      );

      setTodayData(todayData);
      setFutureData(futureData);
    }
  }, [selectedRegion, data]);

  return (
    <Tabs defaultValue="account" className="flex flex-col w-full">
      <TabsList className="mx-auto">
        <TabsTrigger value="account">Today</TabsTrigger>
        <TabsTrigger value="password">Future outages</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Table>
          <TableCaption>Power outages happening right now.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Date</TableHead>
              <TableHead>Locality</TableHead>
              <TableHead>Streets</TableHead>
              <TableHead className="hidden">Disctrict</TableHead>
              <TableHead className="text-right hidden ">From</TableHead>
              <TableHead className="text-right hidden ">To</TableHead>
              <TableHead className="hidden lg:table-cell">Power</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isLoading &&
              todayData &&
              todayData.map((item: OutageItem) => (
                <TableRow key={item.id}>
                  <TableCell className="min-w-[200px]">{item.date}</TableCell>
                  <TableCell className="min-w-[100px]">
                    {item.locality}
                  </TableCell>
                  <TableCell className="min-w-[200px]">
                    {item.streets}
                  </TableCell>
                  <TableCell className="hidden ">{item.district}</TableCell>
                  <TableCell className="text-right hidden ">
                    {formatDate(item.from.toString())}
                  </TableCell>
                  <TableCell className="text-right hidden ">
                    {formatDate(item.to.toString())}
                  </TableCell>
                  <TableCell className="text-right">
                    <div
                      className={`flex items-center justify-center w-[30px] h-[30px]  text-white rounded-full p-1 animate-pulse ${
                        Date.now() > Date.parse(item.from.toString()) &&
                        Date.now() < Date.parse(item.to.toString())
                          ? "bg-gray-800"
                          : "bg-white text-gray-950 shadow"
                      }`}>
                      <Zap className="text-gray-900" width={16} height={16} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && todayData.length === 0 && (
              <TableCell colSpan={7} className="text-xl  p-16 text-center">
                No outages found
              </TableCell>
            )}
            {isLoading && (
              <>
                <TableSkeleton />
                <TableSkeleton />
                <TableSkeleton />
                <TableSkeleton />
                <TableSkeleton />
                <TableSkeleton />
                <TableSkeleton />
                <TableSkeleton />
                <TableSkeleton />
                <TableSkeleton />
                <TableSkeleton />
                <TableSkeleton />
              </>
            )}
          </TableBody>
        </Table>
      </TabsContent>
      <TabsContent className="w-full" value="password">
        <Table>
          <TableCaption>Power outages happening right now.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Date</TableHead>
              <TableHead className="min-w-[100px]">Locality</TableHead>
              <TableHead className="min-w-[200px]">Streets</TableHead>
              <TableHead className=" hidden lg:table-cell">Disctrict</TableHead>
              <TableHead className="text-right  hidden lg:table-cell">
                From
              </TableHead>
              <TableHead className="text-right  hidden lg:table-cell">
                To
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isLoading &&
              futureData &&
              futureData.map((item: OutageItem) => (
                <TableRow key={item.id}>
                  <TableCell className="min-w-[200px]">{item.date}</TableCell>
                  <TableCell className="min-w-[100px]">
                    {item.locality}
                  </TableCell>
                  <TableCell className="min-w-[200px]">
                    {item.streets}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {item.district}
                  </TableCell>
                  <TableCell className="text-right hidden lg:table-cell">
                    {formatDate(item.from.toString())}
                  </TableCell>
                  <TableCell className="text-right hidden lg:table-cell">
                    {formatDate(item.to.toString())}
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && futureData.length === 0 && (
              <TableCell colSpan={7} className="text-xl  p-16 text-center">
                No outages found
              </TableCell>
            )}
            {isLoading && (
              <>
                <TableSkeleton />
                <TableSkeleton />
                <TableSkeleton />
                <TableSkeleton />
                <TableSkeleton />
                <TableSkeleton />
                <TableSkeleton />
                <TableSkeleton />
                <TableSkeleton />
                <TableSkeleton />
                <TableSkeleton />
                <TableSkeleton />
              </>
            )}
          </TableBody>
        </Table>
      </TabsContent>
    </Tabs>
  );
};

export default OutageTable;
