import { useEffect, useState } from "react";
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
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<BranchInventoryProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] =
    useState<BranchInventoryProduct | null>(null);
  const [isAddToCartOpen, setIsAddToCartOpen] = useState(false);
  const [filters, setFilters] = useState<CashierFilterValues>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

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
    setSelectedProduct(product);
    setIsAddToCartOpen(true);
  };

  const handleAddToCart = (quantity: number) => {
    if (selectedProduct) {
      const { pId, productName: name, price } = selectedProduct;
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

        <div className="grid auto-rows-[188px] grid-cols-[repeat(3,333px)] justify-between gap-6">
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
            products.map((product) => (
              <ProductCard
                key={product.pId}
                productId={product.pId}
                productName={product.productName}
                description={product.description}
                category={formatCategories(product)}
                price={product.price}
                onAddToCart={() => openAddToCart(product)}
              />
            ))
          )}

          {isCartOpen && (
            // Spans 3 product rows (612px), which leaves room for 3 cart items
            // before the list scrolls; products flow around it.
            <CartPanel
              className="col-start-3 row-span-3 row-start-1"
              items={cartItems}
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
          onAddToCart={handleAddToCart}
        />
      )}
    </main>
  );
}
