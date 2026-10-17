import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { StockErrorMessage } from "./stock-error-message";

export interface ProductCardProps {
  productId: number;
  productName: string;
  description: string;
  category: string;
  price: number;
  onAddToCart: () => void;
  isOutOfStock?: boolean;
}

interface ProductInfoProps extends Omit<ProductCardProps, "onAddToCart"> {
  className?: string;
  nameClassName?: string;
  badgeClassName?: string;
  children: ReactNode;
}

export function ProductInfo({
  productId,
  productName,
  description,
  category,
  price,
  className,
  nameClassName,
  badgeClassName,
  children,
}: ProductInfoProps) {
  return (
    <article
      className={cn(
        "flex flex-col gap-2 rounded-lg p-4 text-sidebar-top",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="m-0 text-xs text-muted-foreground">ID: {productId}</p>
        <h2 className={cn("m-0 truncate text-lg font-bold", nameClassName)}>
          {productName}
        </h2>
      </div>
      <p className="m-0 line-clamp-1 text-sm">{description}</p>
      {category && (
        <Badge
          className={cn(
            "h-auto border-currency-card bg-currency-card px-2 py-0.5 text-xs font-normal text-sidebar-top",
            badgeClassName,
          )}
        >
          {category}
        </Badge>
      )}
      <div className="mt-auto flex items-end justify-between gap-3">
        <p className="m-0 text-lg leading-9 font-semibold">
          {price.toFixed(2)} ฿
        </p>
        {children}
      </div>
    </article>
  );
}

export function ProductCard({
  onAddToCart,
  isOutOfStock = false,
  ...product
}: ProductCardProps) {
  return (
    <div className="flex w-[333px] flex-col gap-1">
      <ProductInfo
        {...product}
        className={cn(
          "h-[188px] w-[333px] bg-textbox transition-colors",
          isOutOfStock && "border-2 border-base-red-bright",
        )}
      >
        <Button
          type="button"
          size="lg"
          className="h-9 px-4 text-sm"
          onClick={onAddToCart}
        >
          Add to Cart
        </Button>
      </ProductInfo>
      {isOutOfStock && (
        <StockErrorMessage message="Product’s out of stock" className="px-1" />
      )}
    </div>
  );
}
