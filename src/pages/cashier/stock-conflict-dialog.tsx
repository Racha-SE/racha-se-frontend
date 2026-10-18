import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface StockConflictItem {
  pId: number;
  productName: string;
  requested: number;
  available: number;
}

interface StockConflictDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflicts: StockConflictItem[];
  onBackToCart: () => void;
  onAdjustCart: () => void;
}

export function StockConflictDialog({
  open,
  onOpenChange,
  conflicts,
  onBackToCart,
  onAdjustCart,
}: StockConflictDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/30"
        className="w-full gap-5 rounded-2xl bg-white p-6 sm:max-w-[490px]"
      >
        <div className="flex flex-col gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-destructive-subtle text-destructive">
            <TriangleAlert className="size-5" aria-hidden="true" />
          </div>

          <div className="flex flex-col gap-1.5">
            <DialogTitle className="text-xl font-bold tracking-tight text-sidebar-top">
              Stock no longer available
            </DialogTitle>
            <DialogDescription className="text-sm text-sidebar-middle">
              Another checkout just used up some of this stock, so your order
              could not be completed.
            </DialogDescription>
          </div>
        </div>

        <div className="overflow-hidden rounded-md border border-border/80">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-border/80 bg-textbox">
              <tr className="divide-x divide-border/80">
                <th className="px-3.5 py-2.5 font-semibold text-sidebar-top">
                  Product
                </th>
                <th className="px-3.5 py-2.5 font-semibold text-sidebar-top">
                  You requested
                </th>
                <th className="px-3.5 py-2.5 font-semibold text-sidebar-top">
                  Available now
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/80 bg-white">
              {conflicts.map((item) => {
                const isOutOfStock = item.available <= 0;

                return (
                  <tr key={item.pId} className="divide-x divide-border/80">
                    <td className="px-3.5 py-2.5 text-sidebar-top">
                      {item.productName}
                    </td>
                    <td className="px-3.5 py-2.5 text-sidebar-top">
                      {item.requested}
                    </td>
                    <td
                      className={cn(
                        "px-3.5 py-2.5 font-medium",
                        isOutOfStock
                          ? "text-base-red-bright"
                          : "text-sidebar-top",
                      )}
                    >
                      {isOutOfStock ? "0 (out of stock)" : item.available}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="rounded-md bg-emerald-50 px-3.5 py-2.5 text-xs font-normal text-emerald-800">
          No payment was charged. Nothing was deducted from stock.
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="h-9.5 rounded-lg border-border px-5 text-sm font-medium text-sidebar-top hover:bg-muted"
            onClick={onBackToCart}
          >
            Back to cart
          </Button>
          <Button
            type="button"
            className="h-9.5 rounded-lg bg-primary px-5 text-sm font-medium text-white hover:bg-primary/90"
            onClick={onAdjustCart}
          >
            Adjust cart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
