import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";

import { getProducts, type Product } from "@/api/product";
import { Input } from "@/components/ui/input";

import { AddToCartDialog } from "./add-to-cart-dialog";
import {
  CashierFilterDialog,
  type CashierFilterValues,
} from "./cashier-filter-dialog";
import { ProductCard } from "./product-card";

// Placeholder options until the filter is wired to the categories API.
const categoryOptions = [
  { label: "Beverages", value: "1" },
  { label: "Household", value: "2" },
];

function formatCategories(product: Product) {
  return product.categories.map((category) => category.categoryName).join(", ");
}

export function CashierPage() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddToCartOpen, setIsAddToCartOpen] = useState(false);
  const [filters, setFilters] = useState<CashierFilterValues>({});

  useEffect(() => {
    async function loadProducts() {
      const response = await getProducts({ isActive: true });
      setProducts(response.data.products);
    }

    void loadProducts();
  }, []);

  const openAddToCart = (product: Product) => {
    setSelectedProduct(product);
    setIsAddToCartOpen(true);
  };

  const addToCart = () => {
    setIsAddToCartOpen(false);
  };

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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Input
            className="h-8 max-w-[400px] rounded-sm border-border bg-searchbar px-3 text-primary-foreground placeholder:text-primary-foreground/70 focus-visible:border-focus focus-visible:ring-focus/20"
            value={search}
            placeholder="Search product ID / name / description"
            aria-label="Search products"
            onChange={(event) => setSearch(event.target.value)}
          />
          <CashierFilterDialog
            categories={categoryOptions}
            value={filters}
            onApply={setFilters}
          />
        </div>

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
                category={formatCategories(product)}
                price={product.costPrice}
                onAddToCart={() => openAddToCart(product)}
              />
            ))}
          </div>
        )}
      </section>

      {selectedProduct && (
        <AddToCartDialog
          key={selectedProduct.pId}
          open={isAddToCartOpen}
          onOpenChange={setIsAddToCartOpen}
          productId={selectedProduct.pId}
          productName={selectedProduct.name}
          description={selectedProduct.description ?? ""}
          category={formatCategories(selectedProduct)}
          price={selectedProduct.costPrice}
          onAddToCart={addToCart}
        />
      )}
    </main>
  );
}
