import { apiClient } from "@/api/client";

export type NotificationType = "expire" | "min_stock";

export interface StockAlert {
  notificationId: number;
  type: NotificationType;
  branchId: number | null;
  pId: number;
  quantity: number;
  lotId: number | null;
  expiredDate: string | null;
  isResolved: boolean;
  resolvedAt: string | null;
  createdAt: string;
  productName: string;
  barcode: string;
}

export interface GetNotificationsParams {
  limit?: number;
  offset?: number;
}

export interface NotificationListResult {
  result: StockAlert[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  offset: number;
}

interface NotificationListResponse {
  success: true;
  data: NotificationListResult;
}

function buildQuery(params: GetNotificationsParams) {
  const searchParams = new URLSearchParams();

  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }

  if (params.offset !== undefined) {
    searchParams.set("offset", String(params.offset));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function getHqExpireNotifications(
  params: GetNotificationsParams = {},
) {
  const response = await apiClient.get<NotificationListResponse>(
    `/notifications/hq/expire${buildQuery(params)}`,
  );
  return response.data;
}

export async function getHqMinStockNotifications(
  params: GetNotificationsParams = {},
) {
  const response = await apiClient.get<NotificationListResponse>(
    `/notifications/hq/min-stock${buildQuery(params)}`,
  );
  return response.data;
}

export async function getBranchExpireNotifications(
  branchId: number,
  params: GetNotificationsParams = {},
) {
  const response = await apiClient.get<NotificationListResponse>(
    `/notifications/branches/${branchId}/expire${buildQuery(params)}`,
  );
  return response.data;
}

export async function getBranchMinStockNotifications(
  branchId: number,
  params: GetNotificationsParams = {},
) {
  const response = await apiClient.get<NotificationListResponse>(
    `/notifications/branches/${branchId}/min-stock${buildQuery(params)}`,
  );
  return response.data;
}
