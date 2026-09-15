import { useEffect, useState } from "react";
import { Boxes } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getCategories } from "@/api/category";
import {
  getHqInventory,
  type HqInventoryGroup,
  type HqInventoryItem,
} from "@/api/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/pagination-controls";
import { Switch } from "@/components/ui/switch";

import { GroupedInventoryGrid } from "./grouped-inventory-grid";
import {
  InventoryFilterDialog,
  type InventoryFilterValues,
} from "./inventory-filter-dialog";
import { InventoryProductDetailDialog } from "./inventory-product-detail-dialog";
import { InventoryTable } from "./inventory-table";
import type {
  InventoryItem,
  InventoryProduct,
  InventoryProductGroup,
} from "./inventory-types";

const itemsPerPage = 10;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "UTC" }).format(
    new Date(value),
  );
}

function toProduct(item: HqInventoryItem | HqInventoryGroup) {
  return {
    productId: String(item.pId),
    category:
      item.categories.map((category) => category.categoryName).join(", ") ||
      "—",
    productName: item.productName,
    description: item.description,
    barcode: item.barcode,
  };
}

function toInventoryItem(item: HqInventoryItem, index: number): InventoryItem {
  return {
    ...toProduct(item),
    lotId: `${item.pId}-${item.expiredDate}-${index}`,
    quantity: item.quantity,
    costPrice: item.price,
    expiryDate: formatDate(item.expiredDate),
  };
}

function toInventoryGroup(item: HqInventoryGroup): InventoryProductGroup {
  return {
    ...toProduct(item),
    items: item.stocks.map((stock, index) => ({
      lotId: `${item.pId}-${stock.expiredDate}-${index}`,
      quantity: stock.quantity,
      costPrice: stock.price,
      expiryDate: formatDate(stock.expiredDate),
    })),
  };
}

export function InventoryListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [groupByProduct, setGroupByProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<InventoryProduct | null>(null);
  const [filters, setFilters] = useState<InventoryFilterValues>({});
  const [categories, setCategories] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [groups, setGroups] = useState<InventoryProductGroup[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const response = await getCategories();
        if (cancelled) return;

        setCategories(
          response.data.result.map((category) => ({
            label: category.categoryName,
            value: String(category.categoryId),
          })),
        );
      } catch {
        if (!cancelled) setCategories([]);
      }
    }

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getHqInventory({
          search: search.trim() || undefined,
          categoryId: filters.category ? Number(filters.category) : undefined,
          limit: itemsPerPage,
          offset: (page - 1) * itemsPerPage,
          groupBy: groupByProduct,
          sortOption:
            filters.sortBy === "costPrice"
              ? "price"
              : filters.sortBy === "expiryDate"
                ? "expiredDate"
                : undefined,
          sortOrder: filters.sortOrder,
        });
        if (cancelled) return;

        setTotalCount(response.data.totalCount);
        if (groupByProduct) {
          setGroups(
            (response.data.inventory as HqInventoryGroup[]).map(
              toInventoryGroup,
            ),
          );
          setItems([]);
        } else {
          setItems(
            (response.data.inventory as HqInventoryItem[]).map(toInventoryItem),
          );
          setGroups([]);
        }
      } catch {
        if (!cancelled) {
          setError("Couldn't load inventory. Please try again.");
          setItems([]);
          setGroups([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [filters, groupByProduct, page, search]);

  const totalPages = Math.max(Math.ceil(totalCount / itemsPerPage), 1);
  const visibleCount = groupByProduct ? groups.length : items.length;

  return (
    <main className="min-h-screen bg-background p-6 text-left text-foreground">
      <header className="flex h-12 items-center gap-3 rounded-md bg-textbox px-3">
        <Boxes className="size-4.5 text-sidebar-top" aria-hidden="true" />
        <h1 className="m-0 text-base font-semibold tracking-normal text-active">
          Inventory
        </h1>
      </header>

      <section className="mt-4 space-y-4 px-2">
        <div className="flex items-center justify-between gap-3">
          <Input
            className="h-8 max-w-[400px] rounded-sm border-border bg-searchbar px-3 text-base text-primary-foreground placeholder:text-primary-foreground/70 focus-visible:border-focus focus-visible:ring-focus/20"
            value={search}
            placeholder="Search stock"
            aria-label="Search inventory"
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={groupByProduct}
                aria-label="Group inventory by product"
                onCheckedChange={(checked) => {
                  setGroupByProduct(checked);
                  setPage(1);
                }}
              />
              Group by product
            </label>
            <Button
              type="button"
              size="sm"
              className="h-8 bg-primary text-sm text-primary-foreground hover:bg-active focus-visible:ring-focus/30"
              onClick={() => navigate("/hq/orders/new")}
            >
              Add order
            </Button>
            <InventoryFilterDialog
              categories={categories}
              value={filters}
              onApply={(nextFilters) => {
                setFilters(nextFilters);
                setPage(1);
              }}
            />
          </div>
        </div>

        {isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Loading inventory...
          </p>
        ) : error ? (
          <p className="py-8 text-center text-sm text-destructive">{error}</p>
        ) : groupByProduct ? (
          <GroupedInventoryGrid
            groups={groups}
            onViewProduct={setSelectedProduct}
          />
        ) : (
          <InventoryTable items={items} onViewProduct={setSelectedProduct} />
        )}

        {!isLoading && !error && totalCount === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No inventory found.
          </p>
        )}

        {!isLoading && !error && totalCount > 0 && (
          <div className="flex items-center justify-between text-base text-foreground">
            <span>
              Showing {visibleCount} of {totalCount} items
            </span>
            <PaginationControls
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </section>

      <InventoryProductDetailDialog
        product={selectedProduct}
        onOpenChange={(open) => {
          if (!open) setSelectedProduct(null);
        }}
      />
    </main>
  );
}
