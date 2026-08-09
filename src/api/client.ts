const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type ApiClientOptions = Omit<RequestInit, "body" | "method">;

type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "ALREADY_EXISTS"
  | "VALIDATION"
  | "INTERNAL_SERVER_ERROR";

type ApiErrorBody = {
  success: false;
  error: {
    code: ApiErrorCode;
    context?: Record<string, unknown>;
  };
};

function getErrorMessage(status: number, body: unknown) {
  if (isApiErrorBody(body)) {
    return body.error.code;
  }

  return `API request failed with status ${status}`;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    super(getErrorMessage(status, body));
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  return JSON.parse(text) as unknown;
}

async function request<TResponse>(
  path: string,
  options: RequestInit,
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const body = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiError(response.status, body);
  }

  return body as TResponse;
}

function isApiErrorBody(body: unknown): body is ApiErrorBody {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  if (!("success" in body) || body.success !== false) {
    return false;
  }

  if (!("error" in body)) {
    return false;
  }

  const error = body.error;

  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  );
}

export const apiClient = {
  get<TResponse>(path: string, options?: ApiClientOptions) {
    return request<TResponse>(path, {
      ...options,
      method: "GET",
    });
  },

  post<TResponse, TBody>(
    path: string,
    body: TBody,
    options?: ApiClientOptions,
  ) {
    return request<TResponse>(path, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  put<TResponse, TBody>(path: string, body: TBody, options?: ApiClientOptions) {
    return request<TResponse>(path, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  patch<TResponse, TBody>(
    path: string,
    body: TBody,
    options?: ApiClientOptions,
  ) {
    return request<TResponse>(path, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  delete<TResponse>(path: string, options?: ApiClientOptions) {
    return request<TResponse>(path, {
      ...options,
      method: "DELETE",
    });
  },
};
