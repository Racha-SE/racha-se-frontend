import { apiClient } from "@/api/client";

export type Category = {
  categoryId: number;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateCategoryBody = {
  categoryName: string;
};

type ApiResponse<T> = {
  success: true;
  data: T;
};

type CategoryListResult = {
  result: Category[];
};

type CategoryResult = {
  result: Category;
};

export function getCategories() {
  return apiClient.get<ApiResponse<CategoryListResult>>("/categories");
}

export function createCategory(body: CreateCategoryBody) {
  return apiClient.post<ApiResponse<CategoryResult>, CreateCategoryBody>(
    "/categories",
    body,
  );
}

export function deleteCategory(id: number) {
  return apiClient.delete<ApiResponse<CategoryResult>>(`/categories/${id}`);
}
