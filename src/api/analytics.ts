import { apiClient } from "@/api/client";

export type SellerSortBy = "revenue" | "quantity";

type CategoryRef = {
  categoryId: number;
  categoryName: string;
};

export type SellerRank = {
  rank: number;
  pId: number;
  productName: string;
  barcode: string;
  categories: CategoryRef[];
  totalRevenue: number;
  totalQuantity: number;
  orderCount: number;
};

export type DeadStockItem = {
  pId: number;
  productName: string;
  barcode: string;
  categories: CategoryRef[];
  onHandQuantity: number;
  lastSoldAt: string | null;
};

// Timeframe is [from, to) as ISO 8601 date-times. Omitting both gives the
// last 30 days up to now.
type Timeframe = {
  from?: string;
  to?: string;
};

export type BranchSellerRankingQuery = Timeframe & {
  limit?: number; // 1-50, defaults to 10
  sortBy?: SellerSortBy;
  categoryId?: number;
};

export type DeadStockQuery = Timeframe & {
  limit?: number; // 1-100, defaults to 20
  offset?: number;
  categoryId?: number;
};

type SellerRankingResponse = {
  success: true;
  data: {
    from: string;
    to: string;
    sortBy: SellerSortBy;
    result: SellerRank[];
  };
};

type DeadStockResponse = {
  success: true;
  data: {
    from: string;
    to: string;
    totalCount: number;
    result: DeadStockItem[];
  };
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

// Branch routes are always scoped to the signed-in user's own branch.
export function getBranchBestSellers(query: BranchSellerRankingQuery = {}) {
  return apiClient.get<SellerRankingResponse>(
    `/analytics/branch/best-sellers${toQueryString(query)}`,
  );
}

export function getBranchDeadStock(query: DeadStockQuery = {}) {
  return apiClient.get<DeadStockResponse>(
    `/analytics/branch/dead-stock${toQueryString(query)}`,
  );
}
