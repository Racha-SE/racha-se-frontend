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
const pollIntervalMs = 30_000;

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

    // silent = background poll: keep the current list on screen, no spinner, no error.
    async function load(silent: boolean) {
      if (!silent) {
        setIsLoading(true);
        setError(null);
      }

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
        if (!cancelled && !silent) {
          setError("Couldn't load inventory. Please try again.");
          setItems([]);
          setGroups([]);
        }
      } finally {
        if (!cancelled && !silent) setIsLoading(false);
      }
    }

    const timeout = window.setTimeout(() => void load(false), searchDebounceMs);
    const interval = window.setInterval(() => {
      if (!document.hidden) void load(true);
    }, pollIntervalMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [fetchInventory, filters, groupByProduct, itemsPerPage, page, search]);

  return { items, groups, totalCount, isLoading, error };
}
