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

interface NotificationListResponse {
  success: true;
  data: { result: StockAlert[] | null };
}

export async function getHqExpireNotifications() {
  const response = await apiClient.get<NotificationListResponse>(
    "/notifications/hq/expire",
  );
  return response.data.result ?? [];
}

export async function getHqMinStockNotifications() {
  const response = await apiClient.get<NotificationListResponse>(
    "/notifications/hq/min-stock",
  );
  return response.data.result ?? [];
}

export async function getBranchExpireNotifications(branchId: number) {
  const response = await apiClient.get<NotificationListResponse>(
    `/notifications/branches/${branchId}/expire`,
  );
  return response.data.result ?? [];
}

export async function getBranchMinStockNotifications(branchId: number) {
  const response = await apiClient.get<NotificationListResponse>(
    `/notifications/branches/${branchId}/min-stock`,
  );
  return response.data.result ?? [];
}
