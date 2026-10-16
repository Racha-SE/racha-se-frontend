import { apiClient } from "@/api/client";

export type UserType = "hq" | "branch" | "cashier" | "customer";

export type User = {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  image: string | null;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: string | null;
  userType: UserType;
  firstname: string;
  lastname: string;
  username: string;
  birthdate: string | null;
  branchId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type SortDirection = "asc" | "desc";

export type GetUsersParams = {
  branchId?: number;
  userType?: UserType;
  search?: string;
  status?: "active" | "inactive";
  // Separate from userType: "root" means better-auth's role column, not a
  // userType value — see users.model.ts on the backend for why.
  isRoot?: boolean;
  sortId?: SortDirection;
  sortUsername?: SortDirection;
  sortEmail?: SortDirection;
  sortBranch?: SortDirection;
  limit?: number;
  offset?: number;
};

export type ListUsersResult = {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  offset: number;
};

export type CreateUserBody = {
  email: string;
  password: string;
  userType: UserType;
  firstname: string;
  lastname: string;
  username: string;
  birthdate?: string | null;
  branchId?: number | null;
  image?: string | null;
};

export type UpdateUserBody = {
  firstname?: string;
  lastname?: string;
  username?: string;
  birthdate?: string | null;
  branchId?: number | null;
  image?: string | null;
};

type ApiResponse<T> = {
  success: true;
  data: T;
};

export function getUsers(params: GetUsersParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.branchId !== undefined) {
    searchParams.set("branchId", String(params.branchId));
  }

  if (params.userType !== undefined) {
    searchParams.set("userType", params.userType);
  }

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.status !== undefined) {
    searchParams.set("status", params.status);
  }

  if (params.isRoot !== undefined) {
    searchParams.set("isRoot", String(params.isRoot));
  }

  if (params.sortId !== undefined) {
    searchParams.set("sortId", params.sortId);
  }

  if (params.sortUsername !== undefined) {
    searchParams.set("sortUsername", params.sortUsername);
  }

  if (params.sortEmail !== undefined) {
    searchParams.set("sortEmail", params.sortEmail);
  }

  if (params.sortBranch !== undefined) {
    searchParams.set("sortBranch", params.sortBranch);
  }

  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }

  if (params.offset !== undefined) {
    searchParams.set("offset", String(params.offset));
  }

  const query = searchParams.toString();

  return apiClient.get<ApiResponse<ListUsersResult>>(
    `/users${query ? `?${query}` : ""}`,
  );
}

export function getUserById(id: string) {
  return apiClient.get<ApiResponse<User>>(`/users/${id}`);
}

export function createUser(body: CreateUserBody) {
  return apiClient.post<ApiResponse<User>, CreateUserBody>("/users", body);
}

export function updateUser(id: string, body: UpdateUserBody) {
  return apiClient.patch<ApiResponse<User>, UpdateUserBody>(
    `/users/${id}`,
    body,
  );
}

export function deactivateUser(id: string) {
  return apiClient.patch<ApiResponse<User>, Record<string, never>>(
    `/users/${id}/deactivate`,
    {},
  );
}

export function reactivateUser(id: string) {
  return apiClient.patch<ApiResponse<User>, Record<string, never>>(
    `/users/${id}/reactivate`,
    {},
  );
}
