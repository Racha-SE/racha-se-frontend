import { useEffect, useState } from "react";

import type { BranchOrder } from "@/api/orders-branch";
import { getProductById } from "@/api/product";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { formatDateTime, formatOrderId } from "./branch-order-format";

interface BranchOrderItemsDialogProps {
  /** The order to show; `null` keeps the dialog closed. */
  order: BranchOrder | null;
  branchName: string;
  onOpenChange: (open: boolean) => void;
}

export function BranchOrderItemsDialog({
  order,
  branchName,
  onOpenChange,
}: BranchOrderItemsDialogProps) {
  const [productNames, setProductNames] = useState<Map<number, string>>(
    new Map(),
  );

  // Order items only carry pId, so look the names up when an order opens.
  useEffect(() => {
    if (!order) return;

    let ignore = false;
    const pIds = [...new Set(order.items.map((item) => item.pId))];

    Promise.all(
      pIds.map((pId) =>
        getProductById(pId)
          .then((response) => [pId, response.data.name] as const)
          .catch(() => null),
      ),
    ).then((entries) => {
      if (ignore) return;
      setProductNames(new Map(entries.filter((entry) => entry !== null)));
    });

    return () => {
      ignore = true;
    };
  }, [order]);

  return (
    <Dialog open={order !== null} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-sidebar-top/40"
        className="gap-2 p-[30px] sm:max-w-[640px]"
      >
        {order && (
          <>
            <DialogTitle className="text-2xl font-semibold">
              Order {formatOrderId(order.lotId)}
            </DialogTitle>
            <DialogDescription className="text-base text-sidebar-bottom">
              {branchName} · {order.status}
            </DialogDescription>

            <dl className="grid grid-cols-[140px_1fr] gap-y-1 py-2 text-sm">
              <dt className="text-searchbar">Created</dt>
              <dd className="m-0">{formatDateTime(order.createdAt)}</dd>
              {order.status === "rejected" ? (
                <>
                  <dt className="text-searchbar">Rejected</dt>
                  <dd className="m-0 text-destructive">
                    {formatDateTime(order.updatedAt)}
                  </dd>
                  <dt className="text-searchbar">Reason</dt>
                  <dd className="m-0 text-destructive">
                    {order.rejectReason || "No reason given"}
                  </dd>
                </>
              ) : (
                <>
                  <dt className="text-searchbar">Approved</dt>
                  <dd className="m-0">{formatDateTime(order.approvedAt)}</dd>
                  <dt className="text-searchbar">Received</dt>
                  <dd className="m-0">{formatDateTime(order.receivedAt)}</dd>
                </>
              )}
            </dl>

            <div className="max-h-[300px] overflow-y-auto border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="font-bold hover:bg-transparent">
                    <TableHead>Product</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.bodId}>
                      <TableCell>
                        {productNames.get(item.pId) ?? `Product #${item.pId}`}
                      </TableCell>
                      <TableCell>{item.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
