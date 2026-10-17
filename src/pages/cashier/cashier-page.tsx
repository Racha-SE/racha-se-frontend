import { useCallback, useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";

import { getCategories, type Category } from "@/api/category";
import { isInsufficientStockError } from "@/api/client";
import {
  getBranchInventoryByProduct,
  type BranchInventoryProduct,
} from "@/api/inventory";
import { createCustomerOrder } from "@/api/orders";
import { PaginationControls } from "@/components/pagination-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import { AddToCartDialog } from "./add-to-cart-dialog";
import { CartIcon, CartPanel, type CartItem } from "./cart-panel";
import {
  CashierFilterDialog,
  type CashierFilterValues,
} from "./cashier-filter-dialog";
import { ProductCard } from "./product-card";
import {
  StockConflictDialog,
  type StockConflictItem,
} from "./stock-conflict-dialog";
import { useBranchStock } from "./use-branch-stock";

const itemsPerPage = 12;

function formatCategories(product: BranchInventoryProduct) {
  return product.categories.map((category) => category.categoryName).join(", ");
}

export function CashierPage() {
  const { data: session } = useSession();
  const branchId = session?.user.branchId;
  const { getAvailable, refresh: refreshStock } = useBranchStock(branchId);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<BranchInventoryProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] =
    useState<BranchInventoryProduct | null>(null);
  const [isAddToCartOpen, setIsAddToCartOpen] = useState(false);
  const [filters, setFilters] = useState<CashierFilterValues>({});
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [outOfStockProductIds, setOutOfStockProductIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [knownStockMap, setKnownStockMap] = useState<Map<number, number>>(
    () => new Map(),
  );
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [conflictItems, setConflictItems] = useState<StockConflictItem[]>([]);
  const [isConflictDialogOpen, setIsConflictDialogOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
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

  const addToCart = (quantity: number) => {
    if (selectedProduct) {
      const { pId, productName: name, price } = selectedProduct;
      const remaining = getRemainingStock(pId, selectedProduct.quantity);

      if (quantity <= 0 || quantity > remaining || remaining <= 0) {
        return;
      }

      setCartItems((current) =>
        current.some((item) => item.pId === pId)
          ? current.map((item) =>
              item.pId === pId
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            )
          : [...current, { pId, name, price, quantity }],
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

  const handlePayment = async () => {
    if (cartItems.length === 0 || branchId == null || isProcessingPayment) {
      return;
    }

    setIsProcessingPayment(true);

    try {
      // 1. Re-fetch fresh branch stock on payment click
      const freshStock = await refreshStock();

      // ถ้ารีเฟรชสต็อกสำเร็จ (เน็ตไม่หลุด) ค่อยเช็คตรงนี้
      // ถ้าเน็ตหลุด (freshStock = null) ให้ข้ามไปยิง Backend เลย
      if (freshStock) {
        // 2. Validate current cart items against fresh stock
        const conflicts: StockConflictItem[] = [];
        for (const item of cartItems) {
          const available = freshStock.get(item.pId) ?? 0;
          if (item.quantity > available) {
            conflicts.push({
              pId: item.pId,
              productName: item.name,
              requested: item.quantity,
              available: Math.max(0, available),
            });
          }
        }

        if (conflicts.length > 0) {
          setConflictItems(conflicts);
          setIsConflictDialogOpen(true);
          return;
        }
      }

      // 3. Attempt customer order creation
      try {
        await createCustomerOrder({
          paymentMethod: "cash",
          items: cartItems.map((item) => ({
            pId: item.pId,
            quantity: item.quantity,
          })),
        });

        setCartItems([]);
        await refreshStock();
      } catch (err) {
        if (isInsufficientStockError(err)) {
          const latestStock = await refreshStock();
          const pId = err.body.error.context?.pId;
          const requested = err.body.error.context?.requested;
          const availableAmount = err.body.error.context?.availableAmount;

          const raceConflicts: StockConflictItem[] = [];
          for (const item of cartItems) {
            const avail = latestStock
              ? (latestStock.get(item.pId) ?? 0)
              : item.pId === pId && typeof availableAmount === "number"
                ? availableAmount
                : item.quantity;
            if (item.quantity > avail) {
              raceConflicts.push({
                pId: item.pId,
                productName: item.name,
                requested: item.quantity,
                available: Math.max(0, avail),
              });
            }
          }

          if (raceConflicts.length === 0 && typeof pId === "number") {
            const matchedItem = cartItems.find((i) => i.pId === pId);
            raceConflicts.push({
              pId,
              productName: matchedItem?.name ?? `Product #${pId}`,
              requested:
                typeof requested === "number"
                  ? requested
                  : (matchedItem?.quantity ?? 1),
              available:
                typeof availableAmount === "number"
                  ? Math.max(0, availableAmount)
                  : 0,
            });
          }

          setConflictItems(raceConflicts);
          setIsConflictDialogOpen(true);
        } else {
          console.error("Payment failed:", err);
        }
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleAdjustCart = () => {
    const conflictMap = new Map(conflictItems.map((c) => [c.pId, c.available]));

    setCartItems((current) =>
      current
        .map((item) => {
          if (!conflictMap.has(item.pId)) return item;
          const available = conflictMap.get(item.pId)!;
          return available > 0 ? { ...item, quantity: available } : null;
        })
        .filter((item): item is CartItem => item !== null),
    );

    setIsConflictDialogOpen(false);
  };

  const handleBackToCart = () => {
    setIsConflictDialogOpen(false);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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
              onPayment={handlePayment}
              isProcessingPayment={isProcessingPayment}
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
          onAddToCart={addToCart}
        />
      )}

      <StockConflictDialog
        open={isConflictDialogOpen}
        onOpenChange={setIsConflictDialogOpen}
        conflicts={conflictItems}
        onBackToCart={handleBackToCart}
        onAdjustCart={handleAdjustCart}
      />
    </main>
  );
}
