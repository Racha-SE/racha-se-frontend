import { apiClient } from "@/api/client";

export type CreateHqOrderBody = {
  items: Array<{
    pId: number;
    supplierId: number;
    amount: number;
    expiredDate: string;
    basePrice: number;
  }>;
};

type CreateHqOrderResponse = {
  success: true;
  data: unknown;
};

export function createHqOrder(body: CreateHqOrderBody) {
  return apiClient.post<CreateHqOrderResponse, CreateHqOrderBody>(
    "/orders/hq",
    body,
  );
}
