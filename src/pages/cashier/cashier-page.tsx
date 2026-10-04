import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";

import { getProducts, type Product } from "@/api/product";
import { Input } from "@/components/ui/input";

import { ProductCard } from "./product-card";

export function CashierPage() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts() {
      const response = await getProducts({ isActive: true });
      setProducts(response.data.products);
    }

    void loadProducts();
  }, []);

  const addToCart = () => {};

  const searchText = search.trim().toLowerCase();
  const visibleProducts = searchText
    ? products.filter(
        (product) =>
          String(product.pId).includes(searchText) ||
          product.name.toLowerCase().includes(searchText) ||
          (product.description ?? "").toLowerCase().includes(searchText),
      )
    : products;

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

      <section className="mt-4 space-y-4">
        <Input
          className="h-8 max-w-[400px] rounded-sm border-border bg-searchbar px-3 text-primary-foreground placeholder:text-primary-foreground/70 focus-visible:border-focus focus-visible:ring-focus/20"
          value={search}
          placeholder="Search product ID / name / description"
          aria-label="Search products"
          onChange={(event) => setSearch(event.target.value)}
        />

        {visibleProducts.length === 0 ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            No products found.
          </p>
        ) : (
          <div className="grid grid-cols-[repeat(3,333px)] justify-between gap-6">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.pId}
                productId={product.pId}
                productName={product.name}
                description={product.description ?? ""}
                category={product.categories
                  .map((category) => category.categoryName)
                  .join(", ")}
                price={product.costPrice}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
