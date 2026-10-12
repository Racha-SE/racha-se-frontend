import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";

import { getCategories, type Category } from "@/api/category";
import { getProducts, type Product } from "@/api/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { AddToCartDialog } from "./add-to-cart-dialog";
import { CartIcon, CartPanel, type CartItem } from "./cart-panel";
import {
  CashierFilterDialog,
  type CashierFilterValues,
} from "./cashier-filter-dialog";
import { ProductCard } from "./product-card";

function formatCategories(product: Product) {
  return product.categories.map((category) => category.categoryName).join(", ");
}

export function CashierPage() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddToCartOpen, setIsAddToCartOpen] = useState(false);
  const [filters, setFilters] = useState<CashierFilterValues>({});
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      const response = await getCategories();
      setCategories(response.data.result);
    }

    void loadCategories();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      const response = await getProducts({
        isActive: true,
        categoryId: filters.category ? Number(filters.category) : undefined,
      });
      setProducts(response.data.products);
    }

    void loadProducts();
  }, [filters]);

  const categoryOptions = categories.map((category) => ({
    label: category.categoryName,
    value: String(category.categoryId),
  }));

  const openAddToCart = (product: Product) => {
    setSelectedProduct(product);
    setIsAddToCartOpen(true);
  };

  const addToCart = (quantity: number) => {
    if (selectedProduct) {
      const { pId, name, costPrice } = selectedProduct;

      setCartItems((current) =>
        current.some((item) => item.pId === pId)
          ? current.map((item) =>
              item.pId === pId
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            )
          : [...current, { pId, name, price: costPrice, quantity }],
      );
    }

    setIsAddToCartOpen(false);
  };

  const updateCartQuantity = (pId: number, quantity: number) => {
    setCartItems((current) =>
      current.map((item) => (item.pId === pId ? { ...item, quantity } : item)),
    );
  };

  const removeFromCart = (pId: number) => {
    setCartItems((current) => current.filter((item) => item.pId !== pId));
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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
          <div className="flex items-center gap-4">
            <CashierFilterDialog
              categories={categoryOptions}
              value={filters}
              onApply={setFilters}
            />
            <Button
              type="button"
              variant="ghost"
              className="h-10 px-1.5"
              aria-label={isCartOpen ? "Hide cart" : "Show cart"}
              aria-pressed={isCartOpen}
              onClick={() => setIsCartOpen((current) => !current)}
            >
              <CartIcon count={cartCount} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-[repeat(3,333px)] justify-between gap-6">
          <div
            className={cn(
              "grid content-start justify-between gap-6",
              isCartOpen
                ? "col-span-2 grid-cols-[repeat(2,333px)]"
                : "col-span-3 grid-cols-[repeat(3,333px)]",
            )}
          >
            {visibleProducts.length === 0 ? (
              <p className="col-span-full mt-6 text-center text-sm text-muted-foreground">
                No products found.
              </p>
            ) : (
              visibleProducts.map((product) => (
                <ProductCard
                  key={product.pId}
                  productId={product.pId}
                  productName={product.name}
                  description={product.description ?? ""}
                  category={formatCategories(product)}
                  price={product.costPrice}
                  onAddToCart={() => openAddToCart(product)}
                />
              ))
            )}
          </div>

          {isCartOpen && (
            <CartPanel
              items={cartItems}
              onQuantityChange={updateCartQuantity}
              onRemove={removeFromCart}
            />
          )}
        </div>
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
