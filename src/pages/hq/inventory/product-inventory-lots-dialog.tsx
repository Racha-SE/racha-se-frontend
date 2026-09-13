import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

import { InventoryLotTable } from "./inventory-lot-table";
import type { MockInventoryLot } from "./mock-inventory";

interface ProductInventoryLotsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  productId: string;
  items: readonly MockInventoryLot[];
}

export function ProductInventoryLotsDialog({
  open,
  onOpenChange,
  productName,
  productId,
  items,
}: ProductInventoryLotsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-2xl gap-0 overflow-hidden p-0 sm:max-w-2xl"
        overlayClassName="bg-black/30"
      >
        <DialogTitle className="sr-only">
          {productName} inventory lots
        </DialogTitle>
        <DialogDescription className="sr-only">
          All inventory lots for product {productId}
        </DialogDescription>
        <div className="max-h-[55vh] overflow-x-hidden overflow-y-auto">
          <InventoryLotTable items={items} stickyHeader />
        </div>
      </DialogContent>
    </Dialog>
  );
}
