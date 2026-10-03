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
    <article className="flex flex-col gap-3 rounded-lg bg-textbox p-5 text-sidebar-top">
      <h2 className="m-0 text-2xl font-bold">{productName}</h2>
      <p className="m-0 text-base">{description}</p>
      <Badge className="h-auto border-currency-card bg-currency-card px-2 py-0.5 text-base font-normal text-sidebar-top">
        {category}
      </Badge>
      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="m-0 text-2xl font-semibold">{price.toFixed(2)} ฿</p>
        <Button
          type="button"
          size="lg"
          className="h-11 px-5 text-base"
          onClick={onAddToCart}
        >
          Add to Cart
        </Button>
      </div>
    </article>
  );
}
