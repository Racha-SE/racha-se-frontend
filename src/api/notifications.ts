import { apiClient } from "@/api/client";

/**
 * Matches racha-se-backend's notification table
 * (racha-se-backend/src/db/schema/notification.ts), joined with the
 * product's name/barcode (the notification row itself only stores pId).
 *
 * These are the HQ-scoped endpoints (branchId IS NULL) — no branchId param
 * needed, unlike the /branches/:branchId/* variants.
 *
 * Field meaning depends on `type` (a snapshot at creation time, not a live
 * join) — see the backend schema comment:
 * - "expire": lotId + pId identify the lot, quantity is units in that lot,
 *   expiredDate is when it expires.
 * - "min_stock": quantity is remaining stock for that product/scope at
 *   creation time; lotId and expiredDate are unused.
 */
export type NotificationType = "expire" | "min_stock";

export interface HqNotification {
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
  result: HqNotification[];
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
