import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  productName: string;
  description: string;
  category: string;
  price: number;
  onAddToCart: () => void;
}

export function ProductCard({
  productName,
  description,
  category,
  price,
  onAddToCart,
}: ProductCardProps) {
  return (
    <article className="flex h-[172px] w-[333px] flex-col gap-2 rounded-lg bg-textbox p-4 text-sidebar-top">
      <h2 className="m-0 truncate text-lg font-bold">{productName}</h2>
      <p className="m-0 line-clamp-1 text-sm">{description}</p>
      {category && (
        <Badge className="h-auto border-currency-card bg-currency-card px-2 py-0.5 text-xs font-normal text-sidebar-top">
          {category}
        </Badge>
      )}
      <div className="mt-auto flex items-center justify-between gap-3">
        <p className="m-0 text-lg font-semibold">{price.toFixed(2)} ฿</p>
        <Button
          type="button"
          size="lg"
          className="h-9 px-4 text-sm"
          onClick={onAddToCart}
        >
          Add to Cart
        </Button>
      </div>
    </article>
  );
}
