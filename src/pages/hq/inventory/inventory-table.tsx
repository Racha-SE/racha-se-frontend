import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { InventoryItem, InventoryProduct } from "./inventory-types";

interface InventoryTableProps {
  items: readonly InventoryItem[];
  onViewProduct: (product: InventoryProduct) => void;
}

export function InventoryTable({ items, onViewProduct }: InventoryTableProps) {
  return (
    <div className="border border-border">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="h-auto border-r border-border px-4 py-2 font-semibold">
              Product ID
            </TableHead>
            <TableHead className="h-auto border-r border-border px-4 py-2 font-semibold">
              Product Category
            </TableHead>
            <TableHead className="h-auto border-r border-border px-4 py-2 font-semibold">
              Product Name
            </TableHead>
            <TableHead className="h-auto border-r border-border px-4 py-2 font-semibold">
              Quantity
            </TableHead>
            <TableHead className="h-auto border-r border-border px-4 py-2 font-semibold">
              Cost Price
            </TableHead>
            <TableHead className="h-auto border-r border-border px-4 py-2 font-semibold">
              Expiry Date
            </TableHead>
            <TableHead className="h-auto px-4 py-2 font-semibold">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.lotId}
              className="border-border even:bg-textbox hover:bg-primary-subtle"
            >
              <TableCell className="h-auto border-r border-border px-4 py-2">
                {item.productId}
              </TableCell>
              <TableCell className="h-auto border-r border-border px-4 py-2">
                {item.category}
              </TableCell>
              <TableCell className="h-auto border-r border-border px-4 py-2">
                {item.productName}
              </TableCell>
              <TableCell className="h-auto border-r border-border px-4 py-2">
                {item.quantity}
              </TableCell>
              <TableCell className="h-auto border-r border-border px-4 py-2">
                ฿{item.costPrice.toFixed(2)}
              </TableCell>
              <TableCell className="h-auto border-r border-border px-4 py-2">
                {item.expiryDate}
              </TableCell>
              <TableCell className="h-auto px-4 py-2">
                <div className="flex items-center gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="text-foreground [&_svg]:size-3.5!"
                    aria-label={`View ${item.productName} details`}
                    onClick={() => onViewProduct(item)}
                  >
                    <Eye />
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
