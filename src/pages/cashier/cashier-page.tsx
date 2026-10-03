import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";

import { getProducts, type Product } from "@/api/product";

import { ProductCard } from "./product-card";

export function CashierPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts() {
      const response = await getProducts({ isActive: true });
      setProducts(response.data.products);
    }

    void loadProducts();
  }, []);

  const addToCart = () => {};

  return (
    <main className="min-h-screen bg-background p-6 text-left text-foreground">
      <header className="flex h-12 items-center gap-3 rounded-md bg-textbox px-3">
        <ShoppingCart
          className="size-4.5 text-sidebar-top"
          aria-hidden="true"
        />
        <h1 className="m-0 text-xl font-semibold tracking-normal text-active">
          Selling
        </h1>
      </header>

      {products.length === 0 ? (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          No products available.
        </p>
      ) : (
        <section className="mt-6 grid grid-cols-[repeat(3,333px)] justify-between gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.pId}
              productName={product.name}
              description={product.description ?? ""}
              category={product.categories
                .map((category) => category.categoryName)
                .join(", ")}
              price={product.costPrice}
              onAddToCart={addToCart}
            />
          ))}
        </section>
      )}
    </main>
  );
}
