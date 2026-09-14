import { Eye, PackageX, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { MockOrder } from "./mock-orders";

interface OrderTableProps {
  order: MockOrder;
}

export function OrderTable({ order }: OrderTableProps) {
  return (
    <section className="overflow-hidden border border-border bg-surface">
      <header className="flex h-10 items-center justify-between bg-currency-card px-3">
        <p className="text-sm">Order ID: {order.orderId}</p>

        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="text-foreground [&_svg]:size-3.5!"
            aria-label={`View order ${order.orderId}`}
          >
            <Eye />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="text-foreground [&_svg]:size-3.5!"
            aria-label={`Manage order ${order.orderId}`}
          >
            <Settings />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="text-destructive [&_svg]:size-3.5!"
            aria-label={`Cancel order ${order.orderId}`}
          >
            <PackageX />
          </Button>
        </div>
      </header>

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
              Supplier
            </TableHead>
            <TableHead className="h-auto border-r border-border px-4 py-2 text-base font-semibold">
              Quantity
            </TableHead>
            <TableHead className="h-auto border-r border-border px-4 py-2 text-base font-semibold">
              Cost Price
            </TableHead>
            <TableHead className="h-auto px-4 py-2 text-base font-semibold">
              Expiry Date
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {order.items.map((item) => (
            <TableRow
              key={item.orderItemId}
              className="border-border even:bg-textbox hover:bg-primary-subtle"
            >
              <TableCell className="border-r border-border px-4 py-2 text-base">
                {item.productId}
              </TableCell>
              <TableCell className="border-r border-border px-4 py-2 text-base">
                {item.productCategory}
              </TableCell>
              <TableCell className="border-r border-border px-4 py-2 text-base">
                {item.productName}
              </TableCell>
              <TableCell className="border-r border-border px-4 py-2 text-base">
                {item.supplier}
              </TableCell>
              <TableCell className="border-r border-border px-4 py-2 text-base">
                {item.quantity}
              </TableCell>
              <TableCell className="border-r border-border px-4 py-2 text-base">
                ฿{item.costPrice.toFixed(2)}
              </TableCell>
              <TableCell className="px-4 py-2 text-base">
                {item.expiryDate}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
