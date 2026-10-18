import { useCallback, useEffect, useState } from "react";
import { ClipboardList, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getCategories, type Category } from "@/api/category";
import {
  getBranchInventoryByProduct,
  type BranchInventoryProduct,
} from "@/api/inventory";
import { PaginationControls } from "@/components/pagination-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import { AddToCartDialog } from "./add-to-cart-dialog";
import { useCart } from "./cart-context";
import { CartIcon, CartPanel } from "./cart-panel";
import {
  CashierFilterDialog,
  type CashierFilterValues,
} from "./cashier-filter-dialog";
import { ProductCard } from "./product-card";
import { useBranchStock } from "./use-branch-stock";

const itemsPerPage = 12;

function formatCategories(product: BranchInventoryProduct) {
  return product.categories.map((category) => category.categoryName).join(", ");
}

export function CashierPage() {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const branchId = session?.user.branchId;
  const {
    cartItems,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    cartCount,
  } = useCart();
  const { getAvailable } = useBranchStock(branchId);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<BranchInventoryProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] =
    useState<BranchInventoryProduct | null>(null);
  const [isAddToCartOpen, setIsAddToCartOpen] = useState(false);
  const [filters, setFilters] = useState<CashierFilterValues>({});

  const [outOfStockProductIds, setOutOfStockProductIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [knownStockMap, setKnownStockMap] = useState<Map<number, number>>(
    () => new Map(),
  );

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const getAvailableStock = useCallback(
    (pId: number): number => {
      const live = getAvailable(pId);
      if (live !== undefined) return live;
      const known = knownStockMap.get(pId);
      if (known !== undefined) return known;
      const current = products.find((p) => p.pId === pId);
      return current?.quantity ?? 0;
    },
    [getAvailable, knownStockMap, products],
  );

  const getRemainingStock = useCallback(
    (pId: number, fallbackQuantity?: number): number => {
      const currentCartQty =
        cartItems.find((item) => item.pId === pId)?.quantity ?? 0;
      const available = getAvailableStock(pId) ?? fallbackQuantity ?? 0;
      return Math.max(0, available - currentCartQty);
    },
    [cartItems, getAvailableStock],
  );

  useEffect(() => {
    async function loadCategories() {
      const response = await getCategories();
      setCategories(response.data.result);
    }

    void loadCategories();
  }, []);

  useEffect(() => {
    if (branchId == null) return;

    let ignore = false;

    async function loadProducts(branchId: number) {
      const response = await getBranchInventoryByProduct(branchId, {
        search: search.trim() || undefined,
        categoryId: filters.category ? Number(filters.category) : undefined,
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
      });
      if (ignore) return;

      setProducts(response.data.inventory);
      setTotalCount(response.data.totalCount);
      setKnownStockMap((prev) => {
        const next = new Map(prev);
        for (const item of response.data.inventory) {
          if (typeof item.quantity === "number") {
            next.set(item.pId, item.quantity);
          }
        }
        return next;
      });
    }

    void loadProducts(branchId);

    return () => {
      ignore = true;
    };
  }, [branchId, search, filters, page]);

  const totalPages = Math.max(Math.ceil(totalCount / itemsPerPage), 1);

  const categoryOptions = categories.map((category) => ({
    label: category.categoryName,
    value: String(category.categoryId),
  }));

  const openAddToCart = (product: BranchInventoryProduct) => {
    if (typeof product.quantity === "number") {
      setKnownStockMap((prev) =>
        new Map(prev).set(product.pId, product.quantity),
      );
    }
    setSelectedProduct(product);
    setIsAddToCartOpen(true);
  };

  const handleProductAddToCart = (product: BranchInventoryProduct) => {
    const remaining = getRemainingStock(product.pId, product.quantity);
    if (remaining <= 0) {
      setOutOfStockProductIds((current) => new Set(current).add(product.pId));
      return;
    }

    setOutOfStockProductIds((current) => {
      if (!current.has(product.pId)) return current;
      const next = new Set(current);
      next.delete(product.pId);
      return next;
    });
    openAddToCart(product);
  };

  const handleAddToCart = (quantity: number) => {
    if (selectedProduct) {
      const { pId, productName: name, price } = selectedProduct;
      const remaining = getRemainingStock(pId, selectedProduct.quantity);

      if (quantity <= 0 || quantity > remaining || remaining <= 0) {
        return;
      }

      addToCart({ pId, name, price }, quantity);
    }

    setIsAddToCartOpen(false);
  };

  return (
    <main className="min-h-screen bg-background p-6 text-left text-foreground">
      <header className="flex h-12 items-center gap-3 rounded-md bg-textbox px-3">
        <ShoppingCart
          className="size-4.5 text-sidebar-top"
          aria-hidden="true"
        />
        <h1 className="m-0 text-xl font-semibold tracking-normal text-active">
          POS
        </h1>
      </header>

      <section className="mt-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Input
            className="h-8 max-w-[400px] rounded-sm border-border bg-searchbar px-3 text-primary-foreground placeholder:text-primary-foreground/70 focus-visible:border-focus focus-visible:ring-focus/20"
            value={search}
            placeholder="Search product name / barcode"
            aria-label="Search products"
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          <div className="flex items-center gap-4">
            <CashierFilterDialog
              categories={categoryOptions}
              value={filters}
              onApply={(nextFilters) => {
                setFilters(nextFilters);
                setPage(1);
              }}
            />
            <Button
              type="button"
              variant="ghost"
              className="h-10 px-1.5"
              aria-label="Order lists"
              onClick={() => navigate("/cashier/order-lists")}
            >
              <ClipboardList
                className="size-8 text-sidebar-top"
                aria-hidden="true"
              />
            </Button>
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

        <div className="grid auto-rows-[minmax(188px,auto)] grid-cols-[repeat(3,333px)] items-start justify-between gap-6">
          {products.length === 0 ? (
            <p
              className={cn(
                "mt-6 text-center text-sm text-muted-foreground",
                isCartOpen ? "col-span-2" : "col-span-3",
              )}
            >
              No products found.
            </p>
          ) : (
            products.map((product) => {
              const isOutOfStock =
                outOfStockProductIds.has(product.pId) &&
                getRemainingStock(product.pId, product.quantity) <= 0;

              return (
                <ProductCard
                  key={product.pId}
                  productId={product.pId}
                  productName={product.productName}
                  description={product.description}
                  category={formatCategories(product)}
                  price={product.price}
                  isOutOfStock={isOutOfStock}
                  onAddToCart={() => handleProductAddToCart(product)}
                />
              );
            })
          )}

          {isCartOpen && (
            // Spans 3 product rows (612px), which leaves room for 3 cart items
            // before the list scrolls; products flow around it.
            <CartPanel
              className="col-start-3 row-span-3 row-start-1"
              items={cartItems}
              getAvailable={getAvailableStock}
              onQuantityChange={updateCartQuantity}
              onRemove={removeFromCart}
              onPayment={() => navigate("/cashier/payment")}
            />
          )}
        </div>

        {totalCount > 0 && (
          <div className="flex items-center justify-between text-sm text-foreground">
            <span>
              Showing {products.length} of {totalCount} items
            </span>
            <PaginationControls
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </section>

      {selectedProduct && (
        <AddToCartDialog
          key={selectedProduct.pId}
          open={isAddToCartOpen}
          onOpenChange={setIsAddToCartOpen}
          productId={selectedProduct.pId}
          productName={selectedProduct.productName}
          description={selectedProduct.description}
          category={formatCategories(selectedProduct)}
          price={selectedProduct.price}
          remainingStock={getRemainingStock(
            selectedProduct.pId,
            selectedProduct.quantity,
          )}
          onAddToCart={handleAddToCart}
        />
      )}
    </main>
  );
}