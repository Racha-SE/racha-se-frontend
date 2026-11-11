import { apiClient } from "@/api/client";

type ApiResponse<T> = {
  success: true;
  data: T;
};

type CategoryRef = {
  categoryId: number;
  categoryName: string;
};

/**
 * Timeframe shared by every analytics query: `[from, to)`, ISO 8601 with an
 * offset (e.g. 2026-10-01T00:00:00+07:00). `from` is inclusive, `to` is
 * exclusive. Omit both for the backend default: the last 30 days.
 */
type AnalyticsTimeframe = {
  from?: string;
  to?: string;
};

export type SellerSortBy = "revenue" | "quantity";

export type BranchBestSellersQuery = AnalyticsTimeframe & {
  /** 1-50, backend default 10 */
  limit?: number;
  /** Backend default "revenue"; the other metric breaks ties */
  sortBy?: SellerSortBy;
  categoryId?: number;
};

export type BranchDeadStockQuery = AnalyticsTimeframe & {
  /** 1-100, backend default 20 */
  limit?: number;
  offset?: number;
  categoryId?: number;
};

export type SellerRank = {
  /** 1-based position in the list; ties still get distinct ranks */
  rank: number;
  pId: number;
  productName: string;
  barcode: string;
  categories: CategoryRef[];
  totalRevenue: number;
  totalQuantity: number;
  /** Completed customer orders that included this product */
  orderCount: number;
};

export type BranchBestSellersResult = {
  /** The timeframe actually used, with the defaults filled in */
  from: string;
  to: string;
  sortBy: SellerSortBy;
  result: SellerRank[];
};

export type DeadStockItem = {
  pId: number;
  productName: string;
  barcode: string;
  categories: CategoryRef[];
  /** Units on hand at the branch, across its unexpired lots */
  onHandQuantity: number;
  /** The branch's latest completed sale of it, at any time; null if never */
  lastSoldAt: string | null;
};

export type BranchDeadStockResult = {
  from: string;
  to: string;
  /** Every dead-stock product, not just the current page */
  totalCount: number;
  result: DeadStockItem[];
};

function toQueryString(
  query: Record<string, string | number | boolean | undefined>,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }

  const result = params.toString();
  return result ? `?${result}` : "";
}

// Branch routes are scoped to the signed-in branch user's own branch on the
// backend, so there is no branchId to pass (a branchId would be ignored).

export function getBranchBestSellers(query: BranchBestSellersQuery = {}) {
  return apiClient.get<ApiResponse<BranchBestSellersResult>>(
    `/analytics/branch/best-sellers${toQueryString(query)}`,
  );
}

export function getBranchDeadStock(query: BranchDeadStockQuery = {}) {
  return apiClient.get<ApiResponse<BranchDeadStockResult>>(
    `/analytics/branch/dead-stock${toQueryString(query)}`,
  );
}

export type HqSellerRankingQuery = BranchBestSellersQuery & {
  /** Only count sales made at this branch; 404 if it doesn't exist */
  branchId?: number;
};

export type SellerRankingResult = BranchBestSellersResult;

export function getHqBestSellers(query: HqSellerRankingQuery = {}) {
  return apiClient.get<ApiResponse<SellerRankingResult>>(
    `/analytics/hq/best-sellers${toQueryString(query)}`,
  );
}

/** Includes products with no sales (zero totals), which rank lowest. */
export function getHqWorstSellers(query: HqSellerRankingQuery = {}) {
  return apiClient.get<ApiResponse<SellerRankingResult>>(
    `/analytics/hq/worst-sellers${toQueryString(query)}`,
  );
}
