import { apiClient } from "@/api/client";

export type SellerSortBy = "revenue" | "quantity";

export type CategoryRef = {
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

export type SellerRankingQuery = {
  from?: string;
  to?: string;
  limit?: number;
  sortBy?: SellerSortBy;
  branchId?: number;
  categoryId?: number;
};

export type BranchSellerRankingQuery = Omit<SellerRankingQuery, "branchId">;

export type DeadStockQuery = {
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
  categoryId?: number;
};

export type SellerRankingResponse = {
  success: true;
  data: {
    from: string;
    to: string;
    sortBy: SellerSortBy;
    result: SellerRank[];
  };
};

export type DeadStockResponse = {
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

export function getHqBestSellers(query: SellerRankingQuery = {}) {
  return apiClient.get<SellerRankingResponse>(
    `/analytics/hq/best-sellers${toQueryString(query)}`,
  );
}

export function getHqWorstSellers(query: SellerRankingQuery = {}) {
  return apiClient.get<SellerRankingResponse>(
    `/analytics/hq/worst-sellers${toQueryString(query)}`,
  );
}

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
