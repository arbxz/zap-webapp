import { ApiResponse, Data, OutageItem } from "@/app/types";
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

interface OutageTableProps {
  data: OutageItem[];
}

const OutageTable = ({ data }: OutageTableProps) => {
  return (
    <div className="w-full">
      <Tabs defaultValue="account" className="flex flex-col">
        <TabsList className="mx-auto">
          <TabsTrigger value="account">Today</TabsTrigger>
          <TabsTrigger value="password">Future outages</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Table>
            <TableCaption>Power outages happening right now.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Date</TableHead>
                <TableHead className="w-[100px]">Locality</TableHead>
                <TableHead>Streets</TableHead>
                <TableHead>Disctrict</TableHead>
                <TableHead className="text-right">From</TableHead>
                <TableHead className="text-right">To</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                {data.map((item: OutageItem) => (
                  <>
                    <TableCell key={item.id}>{item.date}</TableCell>
                    <TableCell>{item.locality}</TableCell>
                    <TableCell>{item.streets}</TableCell>
                    <TableCell>{item.district}</TableCell>
                    <TableCell className="text-right">{item.from}</TableCell>
                    <TableCell className="text-right">{item.to}</TableCell>
                  </>
                ))}
                {/* <TableCell className="font-medium">INV001</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
                <TableCell className="text-right">$250.00</TableCell> */}
              </TableRow>
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent className="w-full" value="password">
          Change your password here.
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OutageTable;
