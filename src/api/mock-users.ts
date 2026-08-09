import { apiClient } from "@/api/client";

export type MockUser = {
  id: string;
  name: string;
};

export type GetMockUsersResponse = {
  success: true;
  data: MockUser[];
};

export type GetMockUserResponse = {
  success: true;
  data: MockUser;
};

export type CreateMockUserBody = {
  name: string;
};

export type CreateMockUserResponse = {
  success: true;
  data: MockUser;
};

export function getMockUsers() {
  return apiClient.get<GetMockUsersResponse>("/mock/users");
}

export function getMockUser(id: string) {
  return apiClient.get<GetMockUserResponse>(
    `/mock/users/${encodeURIComponent(id)}`,
  );
}

export function createMockUser(body: CreateMockUserBody) {
  return apiClient.post<CreateMockUserResponse, CreateMockUserBody>(
    "/mock/users",
    body,
  );
}
