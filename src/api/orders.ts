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

export type CustomerOrderItem = {
  codId: number;
  quantity: number;
  expiredDate: string;
  branchId: number;
  pId: number;
  price: number;
};

export type CustomerOrder = {
  lotId: number;
  orderType: "customer";
  createdAt: string;
  userId: string;
  status: "pending" | "approved" | "rejected" | "completed";
  branchId: number;
  items: CustomerOrderItem[];
  approvedBy?: string | null;
  approvedAt?: string | null;
  receivedAt?: string | null;
  rejectReason?: string | null;
  updatedAt?: string | null;
};

export type GetCustomerOrdersResponse = {
  success: true;
  data: {
    orders: CustomerOrder[];
    limit: number;
    offset: number;
    totals: number;
  };
};

export type GetCustomerOrderByIdResponse = {
  success: true;
  data: CustomerOrder;
};

export type CreateCustomerOrderItem = {
  pId: number;
  quantity: number;
};

export type CreateCustomerOrderBody = {
  paymentMethod: "cash" | "qr";
  items: CreateCustomerOrderItem[];
};

export type CreateCustomerOrderResponse = {
  success: true;
  data: CustomerOrder & { paymentUrl?: string };
};

export function getCustomerOrders(
  query: {
    status?: string;
    limit?: number;
    offset?: number;
  } = {},
) {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (query.limit !== undefined) params.set("limit", String(query.limit));
  if (query.offset !== undefined) params.set("offset", String(query.offset));

  const qs = params.toString();
  return apiClient.get<GetCustomerOrdersResponse>(
    `/orders/customer${qs ? `?${qs}` : ""}`,
  );
}

export function getCustomerOrderById(lotId: number) {
  return apiClient.get<GetCustomerOrderByIdResponse>(
    `/orders/customer/${lotId}`,
  );
}

export function createCustomerOrder(body: CreateCustomerOrderBody) {
  return apiClient.post<CreateCustomerOrderResponse, CreateCustomerOrderBody>(
    "/orders/customer",
    body,
  );
}

export function confirmCustomerOrderPayment(lotId: number) {
  return apiClient.patch<
    { success: true; data: CustomerOrder },
    Record<string, never>
  >(`/orders/customer/${lotId}/confirm-payment`, {});
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
