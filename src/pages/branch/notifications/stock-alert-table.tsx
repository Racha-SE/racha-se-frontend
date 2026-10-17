import type { StockAlert } from "@/api/notifications";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StockAlertTableProps {
  items: StockAlert[];
  emptyMessage: string;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-CA");
}

function AlertTypeBadge({ type }: { type: StockAlert["type"] }) {
  return type === "min_stock" ? (
    <Badge className="bg-amber-100 text-amber-800">Low stock</Badge>
  ) : (
    <Badge variant="secondary">Expiring soon</Badge>
  );
}

export function StockAlertTable({ items, emptyMessage }: StockAlertTableProps) {
  if (items.length === 0) {
    return (
      <p className="px-1 py-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="border border-border">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="h-auto border-r border-border px-4 py-2 font-semibold">
              Type
            </TableHead>
            <TableHead className="h-auto border-r border-border px-4 py-2 font-semibold">
              Product
            </TableHead>
            <TableHead className="h-auto border-r border-border px-4 py-2 font-semibold">
              SKU
            </TableHead>
            <TableHead className="h-auto border-r border-border px-4 py-2 text-right font-semibold">
              Quantity
            </TableHead>
            <TableHead className="h-auto border-r border-border px-4 py-2 font-semibold">
              Expires
            </TableHead>
            <TableHead className="h-auto px-4 py-2 font-semibold">
              Raised
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.notificationId}
              className="border-border even:bg-textbox hover:bg-primary-subtle"
            >
              <TableCell className="h-auto border-r border-border px-4 py-2">
                <AlertTypeBadge type={item.type} />
              </TableCell>
              <TableCell className="h-auto border-r border-border px-4 py-2">
                {item.productName}
              </TableCell>
              <TableCell className="h-auto border-r border-border px-4 py-2 text-muted-foreground">
                {item.barcode}
              </TableCell>
              <TableCell className="h-auto border-r border-border px-4 py-2 text-right">
                {item.quantity}
              </TableCell>
              <TableCell className="h-auto border-r border-border px-4 py-2">
                {item.expiredDate ? formatDate(item.expiredDate) : "—"}
              </TableCell>
              <TableCell className="h-auto px-4 py-2">
                {formatDate(item.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
