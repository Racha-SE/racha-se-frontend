import { apiClient } from "@/api/client";

/**
 * Matches racha-se-backend's notification table
 * (racha-se-backend/src/db/schema/notification.ts).
 *
 * IMPORTANT: notificationService is currently a stub — every one of these
 * endpoints returns `data.result: null` right now, because nothing in the
 * backend writes to this table yet (see notification.service.ts's own
 * comment). `null` and an empty array both mean "no open alerts" and are
 * intentionally treated the same way below — that isn't a workaround, it's
 * the correct long-term behavior once the backend ships real data too.
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
 *
 * NOTE: the backend only returns raw IDs (pId), not a joined product name.
 * There's currently no way to show a human-readable product name from this
 * endpoint alone — flagged to the backend team as a known gap.
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
}

interface NotificationListResponse {
  success: true;
  data: { result: HqNotification[] | null };
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
