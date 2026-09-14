import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { InventoryProduct } from "./inventory-types";

interface InventoryProductDetailDialogProps {
  product: InventoryProduct | null;
  onOpenChange: (open: boolean) => void;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-sm text-active">{label}</p>
      <div className="min-h-9 rounded-md border border-input bg-textbox px-3 py-2 text-sm">
        {value || "—"}
      </div>
    </div>
  );
}

export function InventoryProductDetailDialog({
  product,
  onOpenChange,
}: InventoryProductDetailDialogProps) {
  return (
    <Dialog open={product !== null} onOpenChange={onOpenChange}>
      <DialogContent
        className="gap-5 p-6 sm:max-w-xl"
        overlayClassName="bg-black/30"
      >
        <DialogHeader>
          <DialogTitle className="text-lg text-active">
            Product Details
          </DialogTitle>
          <DialogDescription className="sr-only">
            View the selected inventory product information.
          </DialogDescription>
        </DialogHeader>

        {product && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Detail label="Product ID" value={product.productId} />
              <Detail label="Barcode" value={product.barcode} />
            </div>
            <Detail label="Product Name" value={product.productName} />
            <Detail label="Category" value={product.category} />
            <Detail label="Description" value={product.description} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
