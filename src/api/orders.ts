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

// Shared by branch-order.ts and customer-order.ts.
export type OrderStatus = "pending" | "approved" | "rejected" | "completed";

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
