import { useState } from "react";
import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { ProductInfo, type ProductCardProps } from "./product-card";

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
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            size="icon-lg"
            className="rounded-full bg-focus hover:bg-focus/80"
            aria-label="Decrease quantity"
            disabled={quantity <= 1}
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          >
            <Minus className="size-5" />
          </Button>
          <Input
            className="h-8 w-14 bg-textbox text-center"
            inputMode="numeric"
            aria-label="Quantity"
            value={quantity}
            onChange={(event) => {
              const value = Number.parseInt(event.target.value, 10);
              setQuantity(Number.isNaN(value) ? 1 : Math.max(1, value));
            }}
          />
          <Button
            type="button"
            size="icon-lg"
            className="rounded-full bg-focus hover:bg-focus/80"
            aria-label="Increase quantity"
            onClick={() => setQuantity((current) => current + 1)}
          >
            <Plus className="size-5" />
          </Button>
        </div>
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
