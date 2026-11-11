import { ApiError, apiClient, isInsufficientStockError } from "@/api/client";

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

export type StockAdjustmentBody = {
  pId: number;
  /** signed and non-zero: + found more, − damaged/lost/miscounted */
  quantityChange: number;
  /** required, max 255 characters */
  reason: string;
};

export type StockAdjustment = {
  adjustmentId: number;
  branchId: number;
  pId: number;
  quantityChange: number;
  reason: string;
  userId: string;
  createdAt: string;
  /** the product's on-hand total at the branch after the adjustment */
  onHand: number;
};

type StockAdjustmentResponse = {
  success: true;
  data: StockAdjustment;
};

/**
 * Corrects one product's stock at a branch so the system matches the shelf.
 * A minus comes off on-hand lots nearest-expiry first; a plus goes onto the
 * newest unexpired lot.
 */
export function createBranchStockAdjustment(
  branchId: number,
  body: StockAdjustmentBody,
) {
  return apiClient.post<StockAdjustmentResponse, StockAdjustmentBody>(
    `/inventory/branches/${branchId}/adjustments`,
    body,
  );
}

const ADJUSTMENT_ERROR_FALLBACK =
  "Couldn't save the stock adjustment. Please try again.";

/**
 * Text the adjustment form can show for a failed save. Our own messages,
 * picked by status - the backend's `context.message` is written for
 * developers and is never shown.
 */
export function getStockAdjustmentErrorMessage(error: unknown): string {
  if (isInsufficientStockError(error)) {
    const available = error.body.error.context?.availableAmount;
    return available === undefined
      ? "You can't remove more than is on hand."
      : `You can't remove more than is on hand (${available}).`;
  }

  if (!(error instanceof ApiError)) return ADJUSTMENT_ERROR_FALLBACK;

  switch (error.status) {
    case 400:
      return "This adjustment can't be saved. Check the quantity and reason. Stock can only be added to a product this branch has received and that hasn't expired.";
    case 403:
      return "You can only adjust stock for your own branch.";
    case 404:
      return "Product not found.";
    default:
      return ADJUSTMENT_ERROR_FALLBACK;
  }
}
