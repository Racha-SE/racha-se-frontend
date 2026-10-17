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
import { StockErrorMessage } from "./stock-error-message";

interface AddToCartDialogProps extends Omit<ProductCardProps, "onAddToCart"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: (quantity: number) => void;
  remainingStock?: number;
}

export function AddToCartDialog({
  open,
  onOpenChange,
  remainingStock = 0,
  ...props
}: AddToCartDialogProps) {
  const [quantity, setQuantity] = useState(1);
  const isExceeded =
    remainingStock <= 0 ||
    (Number.isFinite(remainingStock) && quantity > remainingStock);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/30"
        className="border-none bg-transparent p-0 shadow-none ring-0 sm:max-w-[620px]"
      >
        <div className="flex w-full flex-col gap-1.5">
          <div className="rounded-xl bg-currency-card p-3 shadow-lg">
            <div className="rounded-lg bg-textbox px-4 py-6">
              <DialogTitle className="text-3xl font-semibold text-active">
                Add to Cart
              </DialogTitle>
            </div>
            <AddToCartDialogBody
              {...props}
              remainingStock={remainingStock}
              quantity={quantity}
              setQuantity={setQuantity}
              isExceeded={isExceeded}
            />
          </div>
          {isExceeded && (
            <StockErrorMessage
              message="Product’s exceeding available stocks"
              className="px-3"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface AddToCartDialogBodyProps extends Omit<
  AddToCartDialogProps,
  "open" | "onOpenChange"
> {
  quantity: number;
  setQuantity: (quantity: number) => void;
  isExceeded: boolean;
  remainingStock: number;
}

function AddToCartDialogBody({
  onAddToCart,
  quantity,
  setQuantity,
  isExceeded,
  remainingStock,
  ...product
}: AddToCartDialogBodyProps) {
  return (
    <ProductInfo
      {...product}
      className="px-2 pt-0 pb-1"
      nameClassName="text-2xl"
      badgeClassName="border-border bg-textbox"
    >
      <div className="flex flex-col items-end gap-3">
        <QuantityStepper
          value={quantity}
          onChange={setQuantity}
          max={remainingStock}
          hasError={isExceeded}
        />
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
            disabled={isExceeded || quantity <= 0}
            onClick={() => {
              if (!isExceeded && quantity > 0) {
                onAddToCart(quantity);
              }
            }}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </ProductInfo>
  );
}
