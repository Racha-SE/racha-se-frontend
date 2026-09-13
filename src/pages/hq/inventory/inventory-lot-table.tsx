import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type { MockInventoryLot } from "./mock-inventory";

interface InventoryLotTableProps {
  items: readonly MockInventoryLot[];
  emptyRows?: number;
  stickyHeader?: boolean;
}

export function InventoryLotTable({
  items,
  emptyRows = 0,
  stickyHeader = false,
}: InventoryLotTableProps) {
  return (
    <Table className="table-fixed">
      <TableHeader
        className={cn(stickyHeader && "sticky top-0 z-10 bg-surface")}
      >
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className="h-10 w-1/4 border-r border-border px-3 text-sm font-semibold">
            Quantity
          </TableHead>
          <TableHead className="h-10 w-[35%] border-r border-border px-3 text-sm font-semibold">
            Cost Price
          </TableHead>
          <TableHead className="h-10 w-[40%] px-3 text-sm font-semibold">
            Expiry Date
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <InventoryLotRow key={item.lotId} item={item} />
        ))}
        {Array.from({ length: emptyRows }, (_, index) => (
          <TableRow
            key={`empty-${index}`}
            className="h-11 border-border even:bg-textbox hover:bg-transparent"
            aria-hidden="true"
          >
            <TableCell className="border-r border-border" />
            <TableCell className="border-r border-border" />
            <TableCell />
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function InventoryLotRow({ item }: { item: MockInventoryLot }) {
  return (
    <TableRow className="h-11 border-border even:bg-textbox hover:bg-primary-subtle">
      <TableCell className="border-r border-border px-3 py-2 text-sm">
        {item.quantity}
      </TableCell>
      <TableCell className="border-r border-border px-3 py-2 text-sm">
        ฿{item.costPrice.toFixed(2)}
      </TableCell>
      <TableCell className="px-3 py-2 text-sm">{item.expiryDate}</TableCell>
    </TableRow>
  );
}
