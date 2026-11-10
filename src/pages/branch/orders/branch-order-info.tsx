import { useEffect, useState } from "react";

import type { BranchOrder } from "@/api/orders-branch";
import { getProductById } from "@/api/product";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { formatExpiryDate } from "@/lib/format-expiry-date";

import { formatDateTime } from "./branch-order-format";

// Same grid look as the order list: vertical rules between columns only.
const GRID_CELL = "border-r border-border last:border-r-0";
const GRID_ROW = "even:bg-textbox hover:bg-primary-subtle";

/** Dates and items of an order; shared by the popup and the detail page. */
export function BranchOrderInfo({
  order,
  showStock = false,
  grid = false,
}: {
  order: BranchOrder;
  /** Adds the per-item remaining and expiry columns (detail page only). */
  showStock?: boolean;
  /** Draws column rules and striped rows (detail page only). */
  grid?: boolean;
}) {
  const cell = grid ? GRID_CELL : undefined;
  const [productNames, setProductNames] = useState<Map<number, string>>(
    new Map(),
  );

  // Order items only carry pId, so look the names up when an order opens.
  useEffect(() => {
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
    <>
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
              <TableHead className={cell}>Product</TableHead>
              <TableHead className={cell}>Amount</TableHead>
              {showStock && (
                <>
                  <TableHead className={cell}>
                    Remaining (of this item&apos;s amount)
                  </TableHead>
                  <TableHead className={cell}>
                    Expiry date (of this item&apos;s batch)
                  </TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.map((item) => (
              <TableRow
                key={item.bodId}
                className={grid ? GRID_ROW : undefined}
              >
                <TableCell className={cell}>
                  {productNames.get(item.pId) ?? `Product #${item.pId}`}
                </TableCell>
                <TableCell className={cell}>{item.amount}</TableCell>
                {showStock && (
                  <>
                    <TableCell className={cell}>{item.remain}</TableCell>
                    <TableCell className={cell}>
                      {formatExpiryDate(item.expiredDate)}
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
