import { useEffect, useState } from "react";

import {
  getHqInventory,
  type HqInventoryGroup,
  type HqInventoryItem,
  type HqInventoryQuery,
} from "@/api/inventory";

import type {
  InventoryFilterValues,
  InventorySortBy,
} from "./inventory-filter-dialog";
import { toInventoryGroup, toInventoryItem } from "./inventory-mappers";
import type { InventoryItem, InventoryProductGroup } from "./inventory-types";

const searchDebounceMs = 300;

const sortOptions: Record<
  InventorySortBy,
  NonNullable<HqInventoryQuery["sortOption"]>
> = {
  expiryDate: "expiredDate",
  costPrice: "costPrice",
};

interface UseInventoryListOptions {
  fetchInventory: typeof getHqInventory;
  search: string;
  filters: InventoryFilterValues;
  groupByProduct: boolean;
  page: number;
  itemsPerPage: number;
}

export function useInventoryList({
  fetchInventory,
  search,
  filters,
  groupByProduct,
  page,
  itemsPerPage,
}: UseInventoryListOptions) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [groups, setGroups] = useState<InventoryProductGroup[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchInventory({
          search: search.trim() || undefined,
          categoryId: filters.category ? Number(filters.category) : undefined,
          limit: itemsPerPage,
          offset: (page - 1) * itemsPerPage,
          groupBy: groupByProduct,
          sortOption: filters.sortBy ? sortOptions[filters.sortBy] : undefined,
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
    }, searchDebounceMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [fetchInventory, filters, groupByProduct, itemsPerPage, page, search]);

  return { items, groups, totalCount, isLoading, error };
}
