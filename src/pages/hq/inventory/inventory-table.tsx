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

import type { MockInventoryItem } from "./mock-inventory";

interface InventoryTableProps {
  items: readonly MockInventoryItem[];
}

export function InventoryTable({ items }: InventoryTableProps) {
  return (
    <div className="border border-border">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="h-auto border-r border-border px-4 py-2 text-base font-semibold">
              Product ID
            </TableHead>
            <TableHead className="h-auto border-r border-border px-4 py-2 text-base font-semibold">
              Product Category
            </TableHead>
            <TableHead className="h-auto border-r border-border px-4 py-2 text-base font-semibold">
              Product Name
            </TableHead>
            <TableHead className="h-auto border-r border-border px-4 py-2 text-base font-semibold">
              Quantity
            </TableHead>
            <TableHead className="h-auto border-r border-border px-4 py-2 text-base font-semibold">
              Selling Price
            </TableHead>
            <TableHead className="h-auto border-r border-border px-4 py-2 text-base font-semibold">
              Expiry Date
            </TableHead>
            <TableHead className="h-auto px-4 py-2 text-base font-semibold">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={`${item.productId}-${item.expiryDate}`}
              className="border-border even:bg-textbox hover:bg-primary-subtle"
            >
              <TableCell className="h-auto border-r border-border px-4 py-2 text-base">
                {item.productId}
              </TableCell>
              <TableCell className="h-auto border-r border-border px-4 py-2 text-base">
                {item.category}
              </TableCell>
              <TableCell className="h-auto border-r border-border px-4 py-2 text-base">
                {item.productName}
              </TableCell>
              <TableCell className="h-auto border-r border-border px-4 py-2 text-base">
                {item.quantity}
              </TableCell>
              <TableCell className="h-auto border-r border-border px-4 py-2 text-base">
                ฿{item.sellingPrice.toFixed(2)}
              </TableCell>
              <TableCell className="h-auto border-r border-border px-4 py-2 text-base">
                {item.expiryDate}
              </TableCell>
              <TableCell className="h-auto px-4 py-2">
                <div className="flex items-center gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="text-foreground [&_svg]:size-3.5!"
                    aria-label={`View ${item.productName} stock`}
                  >
                    <Eye />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="text-foreground [&_svg]:size-3.5!"
                    aria-label={`Edit ${item.productName} stock`}
                  >
                    <FilePenLine />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="text-foreground [&_svg]:size-3.5!"
                    aria-label={`Delete ${item.productName} stock`}
                  >
                    <FileX />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
