import { apiClient } from "@/api/client";

export type ProductCategory = {
  categoryId: number;
  categoryName: string;
};

export type Product = {
  pId: number;
  name: string;
  description: string | null;
  barcode: string;
  minStockHq: number;
  minStockBranch: number;
  isActive: boolean;
  costPrice: number;
  createdAt: string;
  updatedAt: string;
  categories: ProductCategory[];
};

export type GetProductsParams = {
  search?: string;
  categoryId?: number;
  isActive?: boolean;
  limit?: number;
  offset?: number;
};

export type ListProductsResult = {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  offset: number;
};

export type CreateProductBody = {
  name: string;
  description?: string | null;
  barcode: string;
  minStockHq: number;
  minStockBranch: number;
  isActive?: boolean;
  costPrice: number;
  categoryIds?: number[];
};

export type UpdateProductBody = Partial<CreateProductBody>;

type ApiResponse<T> = {
  success: true;
  data: T;
};

export function getProducts(params: GetProductsParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.categoryId !== undefined) {
    searchParams.set("categoryId", String(params.categoryId));
  }

  if (params.isActive !== undefined) {
    searchParams.set("isActive", String(params.isActive));
  }

  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }

  if (params.offset !== undefined) {
    searchParams.set("offset", String(params.offset));
  }

  const query = searchParams.toString();

  return apiClient.get<ApiResponse<ListProductsResult>>(
    `/products${query ? `?${query}` : ""}`,
  );
}

export function getProductById(id: number) {
  return apiClient.get<ApiResponse<Product>>(`/products/${id}`);
}

export function createProduct(body: CreateProductBody) {
  return apiClient.post<ApiResponse<Product>, CreateProductBody>(
    "/products",
    body,
  );
}

export function updateProduct(id: number, body: UpdateProductBody) {
  return apiClient.patch<ApiResponse<Product>, UpdateProductBody>(
    `/products/${id}`,
    body,
  );
}

export function deactivateProduct(id: number) {
  return apiClient.delete<ApiResponse<Product>>(`/products/${id}`);
}
