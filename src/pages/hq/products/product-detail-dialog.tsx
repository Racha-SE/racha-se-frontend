import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { MockProduct } from "./mock-products";

interface ProductDetailDialogProps {
  product: MockProduct | null;
  onOpenChange: (open: boolean) => void;
}

interface DetailFieldProps {
  label: string;
  value: string | number;
  className?: string;
}

function DetailField({ label, value, className = "" }: DetailFieldProps) {
  return (
    <div className={className}>
      <p className="mb-1 text-sm text-active">{label}</p>
      <div className="min-h-9 rounded-md border border-input bg-textbox px-3 py-2 text-sm">
        {value}
      </div>
    </div>
  );
}

export function ProductDetailDialog({
  product,
  onOpenChange,
}: ProductDetailDialogProps) {
  return (
    <Dialog open={product !== null} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[calc(100vh-2rem)] gap-6 overflow-y-auto p-6 sm:max-w-2xl"
        overlayClassName="bg-black/30"
      >
        <DialogHeader>
          <DialogTitle className="text-lg text-active">
            Product Details
          </DialogTitle>
          <DialogDescription className="sr-only">
            View the selected product information.
          </DialogDescription>
        </DialogHeader>

        {product && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailField label="Product ID" value={product.pId} />
              <DetailField label="Barcode" value={product.barcode} />
            </div>

            <DetailField label="Product Name" value={product.name} />

            <div>
              <p className="mb-1 text-sm text-active">Description</p>
              <div className="min-h-[72px] whitespace-pre-wrap rounded-md border border-input bg-textbox px-3 py-2 text-sm">
                {product.description || "—"}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailField label="Selling Price" value={product.sellingPrice} />
              <DetailField label="Cost Price" value={product.costPrice} />
            </div>

            <DetailField label="Category" value={product.category} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailField
                label="Minimum Stock HQ"
                value={product.minStockHq}
              />
              <DetailField
                label="Minimum Stock Branch"
                value={product.minStockBranch}
              />
            </div>

            <DetailField
              label="Status"
              value={product.status === "active" ? "Active" : "Inactive"}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
