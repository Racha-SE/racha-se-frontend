import { Eye, FilePenLine, FileX } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type { MockInventoryItem } from "./mock-inventory";

interface InventoryLotTableProps {
  items: readonly MockInventoryItem[];
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
          <TableHead className="h-10 w-[18%] border-r border-border px-3 text-sm font-semibold">
            Quantity
          </TableHead>
          <TableHead className="h-10 w-[27%] border-r border-border px-3 text-sm font-semibold">
            Selling Price
          </TableHead>
          <TableHead className="h-10 border-r border-border px-3 text-sm font-semibold">
            Expiry Date
          </TableHead>
          <TableHead className="h-10 w-24 px-2 text-sm font-semibold">
            Actions
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
            <TableCell className="border-r border-border" />
            <TableCell />
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function InventoryLotRow({ item }: { item: MockInventoryItem }) {
  return (
    <TableRow className="h-11 border-border even:bg-textbox hover:bg-primary-subtle">
      <TableCell className="border-r border-border px-3 py-2 text-sm">
        {item.quantity}
      </TableCell>
      <TableCell className="border-r border-border px-3 py-2 text-sm">
        ฿{item.sellingPrice.toFixed(2)}
      </TableCell>
      <TableCell className="border-r border-border px-3 py-2 text-sm">
        {item.expiryDate}
      </TableCell>
      <TableCell className="w-24 px-2 py-2">
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="text-foreground [&_svg]:size-3.5!"
            aria-label={`View lot ${item.lotId}`}
          >
            <Eye />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="text-foreground [&_svg]:size-3.5!"
            aria-label={`Edit lot ${item.lotId}`}
          >
            <FilePenLine />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="text-foreground [&_svg]:size-3.5!"
            aria-label={`Delete lot ${item.lotId}`}
          >
            <FileX />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
