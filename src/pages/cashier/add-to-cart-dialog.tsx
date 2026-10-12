import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

import { ProductInfo, type ProductCardProps } from "./product-card";
import { QuantityStepper } from "./quantity-stepper";

interface AddToCartDialogProps extends Omit<ProductCardProps, "onAddToCart"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: (quantity: number) => void;
}

export function AddToCartDialog({
  open,
  onOpenChange,
  ...props
}: AddToCartDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/30"
        className="bg-currency-card p-3 sm:max-w-[620px]"
      >
        <div className="rounded-lg bg-textbox px-4 py-6">
          <DialogTitle className="text-3xl font-semibold text-active">
            Add to Cart
          </DialogTitle>
        </div>
        <AddToCartDialogBody {...props} />
      </DialogContent>
    </Dialog>
  );
}

function AddToCartDialogBody({
  onAddToCart,
  ...product
}: Omit<AddToCartDialogProps, "open" | "onOpenChange">) {
  const [quantity, setQuantity] = useState(1);

  return (
    <ProductInfo
      {...product}
      className="px-2 pt-0 pb-1"
      nameClassName="text-2xl"
      badgeClassName="border-border bg-textbox"
    >
      <div className="flex flex-col items-end gap-3">
        <QuantityStepper value={quantity} onChange={setQuantity} />
        <div className="flex gap-3">
          <DialogClose
            render={
              <Button
                type="button"
                size="lg"
                className="h-11 bg-destructive-active px-5 text-base hover:bg-destructive-active/80"
              />
            }
          >
            Cancel
          </DialogClose>
          <Button
            type="button"
            size="lg"
            className="h-11 px-5 text-base"
            onClick={() => onAddToCart(quantity)}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </ProductInfo>
  );
}
