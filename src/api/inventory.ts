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
  expiredDate: string;
};

export type HqInventoryGroup = Omit<
  HqInventoryItem,
  "quantity" | "price" | "expiredDate"
> & {
  stocks: Array<{
    quantity: number;
    price: number;
    expiredDate: string;
  }>;
};

export type HqInventoryQuery = {
  search?: string;
  categoryId?: number;
  categoryName?: string;
  limit?: number;
  offset?: number;
  sortOption?: "quantity" | "price" | "expiredDate";
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

function toQueryString(query: HqInventoryQuery) {
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
