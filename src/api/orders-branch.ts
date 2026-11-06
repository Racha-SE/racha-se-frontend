import type { OrderStatus } from "@/api/orders";
import { apiClient } from "./client";

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

export async function receiveBranchOrder(lotId: number) {
  return apiClient.patch<
    ApiResponse<ReceiveBranchOrderResponse>,
    Record<string, never>
  >(`/orders/branch/${lotId}/receive`, {});
}
