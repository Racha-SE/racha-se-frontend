import { apiClient } from "@/api/client";

export type Branch = {
  branchId: number;
  name: string;
  address: string;
  phoneNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse<T> = {
  success: true;
  data: T;
};

type BranchListResult = {
  result: Branch[];
};

type BranchResult = {
  result: Branch;
};

export function getBranches() {
  return apiClient.get<ApiResponse<BranchListResult>>("/branches");
}

export function getBranchById(id: number) {
  return apiClient.get<ApiResponse<BranchResult>>(`/branches/${id}`);
}
