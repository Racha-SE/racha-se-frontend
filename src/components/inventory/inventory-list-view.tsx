import { useEffect, useState, type ReactNode } from "react";
import { Boxes } from "lucide-react";

import { getCategories } from "@/api/category";
import { getHqInventory } from "@/api/inventory";
import {
  ActiveFilterChips,
  type ActiveFilterChip,
} from "@/components/active-filter-chips";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/pagination-controls";
import { Switch } from "@/components/ui/switch";

import { GroupedInventoryGrid } from "./grouped-inventory-grid";
import {
  InventoryFilterDialog,
  type InventoryFilterValues,
} from "./inventory-filter-dialog";
import { InventoryProductDetailDialog } from "./inventory-product-detail-dialog";
import { sortOptions, sortOrderOptions } from "./inventory-sort-options";
import { InventoryTable } from "./inventory-table";
import type { InventoryProduct } from "./inventory-types";
import { useInventoryList } from "./use-inventory-list";

const itemsPerPage = 10;

interface InventoryListViewProps {
  fetchInventory: typeof getHqInventory;
  showGroupToggle?: boolean;
  headerActions?: ReactNode;
}

export function InventoryListView({
  fetchInventory,
  showGroupToggle = false,
  headerActions,
}: InventoryListViewProps) {
  const [search, setSearch] = useState("");
  const [groupByProduct, setGroupByProduct] = useState(false);
  const [filters, setFilters] = useState<InventoryFilterValues>({});
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] =
    useState<InventoryProduct | null>(null);

  const [categories, setCategories] = useState<
    Array<{ label: string; value: string }>
  >([]);

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
  const { items, groups, totalCount, isLoading, error } = useInventoryList({
    fetchInventory,
    search,
    filters,
    groupByProduct,
    page,
    itemsPerPage,
  });

  const totalPages = Math.max(Math.ceil(totalCount / itemsPerPage), 1);
  const visibleCount = groupByProduct ? groups.length : items.length;

  // Any change to what's being listed starts back at the first page.
  function applyFilters(nextFilters: InventoryFilterValues) {
    setFilters(nextFilters);
    setPage(1);
  }

  const activeFilterChips: ActiveFilterChip[] = [];

  if (filters.category) {
    const categoryLabel =
      categories.find((option) => option.value === filters.category)?.label ??
      filters.category;

    activeFilterChips.push({
      key: "category",
      label: `Category: ${categoryLabel}`,
      onRemove: () => applyFilters({ ...filters, category: undefined }),
    });
  }

  if (filters.sortBy) {
    const sortByLabel = sortOptions.find(
      (option) => option.value === filters.sortBy,
    )?.label;
    const sortOrderLabel = sortOrderOptions.find(
      (option) => option.value === (filters.sortOrder ?? "asc"),
    )?.label;

    activeFilterChips.push({
      key: "sort",
      label: `Sort: ${sortByLabel} (${sortOrderLabel})`,
      onRemove: () =>
        applyFilters({ ...filters, sortBy: undefined, sortOrder: undefined }),
    });
  }

  return (
    <main className="min-h-screen bg-background p-6 text-left text-foreground">
      <header className="flex h-12 items-center gap-3 rounded-md bg-textbox px-3">
        <Boxes className="size-4.5 text-sidebar-top" aria-hidden="true" />
        <h1 className="m-0 text-xl font-semibold tracking-normal text-active">
          Inventory
        </h1>
      </header>

      <section className="mt-4 space-y-4 px-2">
        <div className="flex items-center justify-between gap-3">
          <Input
            className="h-8 max-w-[400px] rounded-sm border-border bg-searchbar px-3 text-primary-foreground placeholder:text-primary-foreground/70 focus-visible:border-focus focus-visible:ring-focus/20"
            value={search}
            placeholder="Search stock"
            aria-label="Search inventory"
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />

          <div className="flex items-center gap-3">
            {showGroupToggle && (
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
            )}
            {headerActions}
            <InventoryFilterDialog
              categories={categories}
              value={filters}
              onApply={applyFilters}
            />
          </div>
        </div>

        <ActiveFilterChips chips={activeFilterChips} />

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
          <div className="flex items-center justify-between text-sm text-foreground">
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
