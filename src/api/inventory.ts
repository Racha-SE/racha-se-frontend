import { apiClient } from "@/api/client";

export type HqInventoryItem = {
  pId: number;
  productName: string;
  productCategory: string[];
  categories: Array<{
    categoryId: number;
    categoryName: string;
  }>;
  description: string;
  barcode: string;
  quantity: number;
  price: number;
  costPrice: number;
  expiredDate: string;
};

export type HqInventoryGroup = Omit<
  HqInventoryItem,
  "quantity" | "costPrice" | "expiredDate"
> & {
  stocks: Array<{
    quantity: number;
    costPrice: number;
    expiredDate: string;
  }>;
};

export type HqInventoryQuery = {
  search?: string;
  categoryId?: number;
  categoryName?: string;
  limit?: number;
  offset?: number;
  sortOption?: "quantity" | "costPrice" | "expiredDate";
  sortOrder?: "asc" | "desc";
  groupBy?: boolean;
};

type HqInventoryResponse = {
  success: true;
  data: {
    inventory: HqInventoryItem[] | HqInventoryGroup[];
    totalCount: number;
  };
};

export type BranchInventoryProduct = Omit<
  HqInventoryItem,
  "costPrice" | "expiredDate"
>;

export type BranchInventoryQuery = {
  search?: string;
  categoryId?: number;
  limit?: number;
  offset?: number;
};

type BranchInventoryResponse = {
  success: true;
  data: {
    inventory: BranchInventoryProduct[];
    totalCount: number;
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

export function getHqInventory(query: HqInventoryQuery = {}) {
  return apiClient.get<HqInventoryResponse>(
    `/inventory/hq${toQueryString(query)}`,
  );
}

export function getBranchInventory(
  branchId: number,
  query: Omit<HqInventoryQuery, "groupBy"> = {},
) {
  return apiClient.get<HqInventoryResponse>(
    `/inventory/branches/${branchId}${toQueryString({ ...query, groupBy: false })}`,
  );
}

export function getBranchInventoryByProduct(
  branchId: number,
  query: BranchInventoryQuery = {},
  options?: RequestInit,
) {
  return apiClient.get<BranchInventoryResponse>(
    `/inventory/branches/${branchId}${toQueryString({ ...query, groupBy: true })}`,
    options,
  );
}

const branchStockPageSize = 100;

export async function getAllBranchStock(
  branchId: number,
  signal?: AbortSignal,
) {
  const firstPage = await getBranchInventoryByProduct(
    branchId,
    { limit: branchStockPageSize, offset: 0 },
    { signal },
  );
  const { inventory, totalCount } = firstPage.data;

  const offsets: number[] = [];
  for (
    let offset = branchStockPageSize;
    offset < totalCount;
    offset += branchStockPageSize
  ) {
    offsets.push(offset);
  }

  const otherPages = await Promise.all(
    offsets.map((offset) =>
      getBranchInventoryByProduct(
        branchId,
        { limit: branchStockPageSize, offset },
        { signal },
      ),
    ),
  );

  return [...inventory, ...otherPages.flatMap((page) => page.data.inventory)];
}
