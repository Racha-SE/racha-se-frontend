import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { HqNotification, NotificationType } from "@/api/notifications";

interface NotificationTableProps {
  type: NotificationType;
  items: HqNotification[];
  productNames: Record<number, string>;
  emptyMessage: string;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export function NotificationTable({
  type,
  items,
  productNames,
  emptyMessage,
}: NotificationTableProps) {
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
              Product
            </TableHead>
            <TableHead
              className={
                type === "expire"
                  ? "h-auto border-r border-border px-4 py-2 font-semibold"
                  : "h-auto px-4 py-2 font-semibold"
              }
            >
              {type === "expire" ? "Quantity in lot" : "Remaining quantity"}
            </TableHead>
            {type === "expire" && (
              <TableHead className="h-auto px-4 py-2 font-semibold">
                Expires on
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.notificationId}
              className="border-border even:bg-textbox hover:bg-primary-subtle"
            >
              <TableCell className="h-auto border-r border-border px-4 py-2">
                {productNames[item.pId] ?? `Product #${item.pId}`}
              </TableCell>
              <TableCell
                className={
                  type === "expire"
                    ? "h-auto border-r border-border px-4 py-2"
                    : "h-auto px-4 py-2"
                }
              >
                {item.quantity}
              </TableCell>
              {type === "expire" && (
                <TableCell className="h-auto px-4 py-2">
                  {formatDate(item.expiredDate)}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
