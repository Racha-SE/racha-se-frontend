import type { OrderStatus } from "@/api/orders";
import { apiClient } from "./client";

type ApiResponse<T> = {
  success: true;
  data: T;
};

export type BranchOrderItem = {
  branchId: number;
  createdAt: Date;
  updatedAt: Date;
  pId: number;
  price: number;
  amount: number;
  remain: number;
  expiredDate: Date | null;
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

type BranchOrder = {
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  lotId: number;
  orderType: "branch";
  approvedBy: string | null;
  approvedAt: Date | null;
  receivedAt: Date | null;
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

export type CreateBranchOrdersBody = {
  items: BranchOrderItemRequest[];
};

export type CreateBranchOrdersResponse = BranchOrder;

export type ApproveBranchOrdersResponse = BranchOrder;

export type RejectBranchOrdersResponse = BranchOrder;

export type ReceiveBranchOrdersResponse = {
  message: string;
};

export async function getBranchOrders(query: GetBranchOrdersQuery = {}) {
  const params = new URLSearchParams();

  if (query.status) params.set("status", query.status);
  if (query.branchId) params.set("branchId", query.branchId.toString());
  if (query.limit) params.set("limit", query.limit.toString());
  if (query.offset) params.set("offset", query.offset.toString());

  return apiClient.get<ApiResponse<GetBranchOrdersResponse>>(
    `/orders/branch?${params}`,
  );
}

export async function getBranchOrderByLotId(lotId: number) {
  return apiClient.get<ApiResponse<GetBranchOrderByLotIdResponse>>(
    `/orders/branch/${lotId}`,
  );
}

export async function createBranchOrder(body: CreateBranchOrdersBody) {
  return apiClient.post<
    ApiResponse<CreateBranchOrdersResponse>,
    CreateBranchOrdersBody
  >("/orders/branch", body);
}

export async function approveBranchOrder(lotId: number) {
  return apiClient.patch<ApiResponse<ApproveBranchOrdersResponse>, null>(
    `/orders/branch/${lotId}/approve`,
    null,
  );
}

export async function rejectBranchOrder(lotId: number) {
  return apiClient.patch<ApiResponse<RejectBranchOrdersResponse>, null>(
    `/orders/branch/${lotId}/reject`,
    null,
  );
}

export async function receiveBranchOrder(lotId: number) {
  return apiClient.patch<ApiResponse<ReceiveBranchOrdersResponse>, null>(
    `/orders/branch/${lotId}/receive`,
    null,
  );
}
