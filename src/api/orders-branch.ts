import type { OrderStatus } from "@/api/orders";
import { apiClient, getApiErrorDetails } from "./client";

type ApiResponse<T> = {
  success: true;
  data: T;
};

export type BranchOrderItem = {
  branchId: number;
  createdAt: string;
  updatedAt: string;
  pId: number;
  price: number;
  amount: number;
  remain: number;
  expiredDate: string | null;
  costPrice: number;
  bodId: number;
};

export type BranchOrderItemRequest = {
  pId: number;
  amount: number;
};

export type GetBranchOrdersQuery = {
  status?: OrderStatus;
  branchId?: number;
  limit?: number;
  offset?: number;
};

export type BranchOrder = {
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  userId: string;
  lotId: number;
  orderType: "branch";
  branchId?: number;
  approvedBy: string | null;
  approvedAt: string | null;
  receivedAt: string | null;
  rejectReason: string | null;
  items: BranchOrderItem[];
};

export type GetBranchOrderByLotIdResponse = Omit<BranchOrder, "items"> & {
  items: (BranchOrderItem & { availableAmount: number })[];
};

export type GetBranchOrdersResponse = {
  orders: BranchOrder[];
  limit: number;
  offset: number;
  totals: number;
};

export type CreateBranchOrderBody = {
  items: BranchOrderItemRequest[];
};

export type CreateBranchOrderResponse = BranchOrder;

export type ApproveBranchOrderResponse = BranchOrder;

type RejectBranchOrderBody = {
  rejectReason: string;
};

export type RejectBranchOrderResponse = BranchOrder;

export type ReceiveBranchOrderResponse = {
  message: string;
};

/** What the branch counted for one approved line. */
export type ReceiveBranchOrderItem = {
  bodId: number;
  /** 0 up to the line's approved amount */
  receivedQty: number;
  /** ISO date-time, must be in the future */
  expiredDate: string;
};

/**
 * Without `items` the order is received exactly as approved. With it, every
 * line must be listed once.
 */
export type ReceiveBranchOrderBody = {
  items?: ReceiveBranchOrderItem[];
};

export async function getBranchOrders(query: GetBranchOrdersQuery = {}) {
  const params = new URLSearchParams();

  if (query.status) params.set("status", query.status);
  if (query.branchId !== undefined)
    params.set("branchId", query.branchId.toString());
  if (query.limit !== undefined) params.set("limit", query.limit.toString());
  if (query.offset !== undefined) params.set("offset", query.offset.toString());

  const qs = params.toString();

  return apiClient.get<ApiResponse<GetBranchOrdersResponse>>(
    `/orders/branch${qs ? `?${qs}` : ""}`,
  );
}

export async function getBranchOrderByLotId(lotId: number) {
  return apiClient.get<ApiResponse<GetBranchOrderByLotIdResponse>>(
    `/orders/branch/${lotId}`,
  );
}

export async function createBranchOrder(body: CreateBranchOrderBody) {
  return apiClient.post<
    ApiResponse<CreateBranchOrderResponse>,
    CreateBranchOrderBody
  >("/orders/branch", body);
}

export async function approveBranchOrder(lotId: number) {
  return apiClient.patch<
    ApiResponse<ApproveBranchOrderResponse>,
    Record<string, never>
  >(`/orders/branch/${lotId}/approve`, {});
}

export async function rejectBranchOrder(lotId: number, rejectReason: string) {
  return apiClient.patch<
    ApiResponse<RejectBranchOrderResponse>,
    RejectBranchOrderBody
  >(`/orders/branch/${lotId}/reject`, { rejectReason });
}

/**
 * Branch confirms an HQ-approved requisition arrived. The order becomes
 * `completed`, which is when its lines count as branch stock.
 */
export async function receiveBranchOrder(
  lotId: number,
  body: ReceiveBranchOrderBody = {},
) {
  return apiClient.patch<
    ApiResponse<ReceiveBranchOrderResponse>,
    ReceiveBranchOrderBody
  >(`/orders/branch/${lotId}/receive`, body);
}

const RECEIVE_ERROR_FALLBACK =
  "Couldn't record received stock. Please try again.";

/**
 * Text a receive form can show for a failed `receiveBranchOrder`. Messages are
 * our own, picked by status and error code - the backend's `context.message`
 * is never shown, since it's written for developers.
 */
export function getReceiveBranchOrderErrorMessage(error: unknown): string {
  const details = getApiErrorDetails(error);
  if (!details) return RECEIVE_ERROR_FALLBACK;

  const backendMessage =
    typeof details.context?.message === "string" ? details.context.message : "";

  switch (details.status) {
    case 400:
      if (details.code === "VALIDATION") {
        return "Check the received quantities and expiry dates. Expiry dates must be in the future.";
      }
      // A second receive (double-click, two tabs) finds the order already
      // completed and is refused as "Branch order is completed, expected
      // approved".
      if (backendMessage.includes("is completed")) {
        return "This requisition has already been received.";
      }
      if (details.context?.approved !== undefined) {
        return "Received quantity can't be more than the approved quantity.";
      }
      return "This requisition can't be received right now. Refresh to see its latest status.";
    case 403:
      return "You can only receive requisitions for your own branch.";
    case 404:
      return "Requisition not found.";
    case 409:
      return "This requisition has already been received.";
    default:
      return RECEIVE_ERROR_FALLBACK;
  }
}
