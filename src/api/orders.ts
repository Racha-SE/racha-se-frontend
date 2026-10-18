import { apiClient } from "@/api/client";

export type OrderProduct = {
  pId: number;
  name: string;
  barcode: string;
};

export type OrderSupplier = {
  supplierId: number;
  name: string;
};

type OrderProductListResponse = {
  success: true;
  data: {
    products: OrderProduct[];
  };
};

type OrderSupplierListResponse = {
  success: true;
  data: {
    result: OrderSupplier[];
  };
};

export type CreateHqOrderBody = {
  items: Array<{
    pId: number;
    supplierId: number;
    amount: number;
    expiredDate: string;
    costPrice: number;
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

export type CreateCustomerOrderItem = {
  pId: number;
  quantity: number;
};

export type CreateCustomerOrderBody = {
  paymentMethod: "cash" | "qr";
  items: CreateCustomerOrderItem[];
};

type CreateCustomerOrderResponse = {
  success: true;
  data: unknown;
};

export function createCustomerOrder(body: CreateCustomerOrderBody) {
  return apiClient.post<CreateCustomerOrderResponse, CreateCustomerOrderBody>(
    "/orders/customer",
    body,
  );
}

export function getOrderProducts(search = "") {
  const params = new URLSearchParams({
    isActive: "true",
    limit: "20",
    offset: "0",
  });

  if (search.trim()) params.set("search", search.trim());

  return apiClient.get<OrderProductListResponse>(`/products?${params}`);
}

export function getOrderSuppliers() {
  return apiClient.get<OrderSupplierListResponse>("/suppliers");
}
