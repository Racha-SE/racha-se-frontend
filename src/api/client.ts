const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
let isRedirectingToSignIn = false;

type ApiClientOptions = Omit<RequestInit, "body" | "method">;

type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "ALREADY_EXISTS"
  | "INSUFFICIENT_STOCK"
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

export type InsufficientStockContext = {
  message?: string;
  pId?: number;
  requested?: number;
  availableAmount?: number;
};

export type InsufficientStockApiError = ApiError & {
  body: {
    success: false;
    error: {
      code: "INSUFFICIENT_STOCK";
      context?: InsufficientStockContext;
    };
  };
};

export function isInsufficientStockError(
  error: unknown,
): error is InsufficientStockApiError {
  if (!(error instanceof ApiError) || error.status !== 409) {
    return false;
  }

  if (typeof error.body !== "object" || error.body === null) {
    return false;
  }

  const errObj = (error.body as Record<string, unknown>).error;
  return (
    typeof errObj === "object" &&
    errObj !== null &&
    (errObj as Record<string, unknown>).code === "INSUFFICIENT_STOCK"
  );
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function request<TResponse>(
  path: string,
  options: RequestInit,
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const body = await parseResponseBody(response);

  if (!response.ok) {
    if (
      response.status === 401 &&
      window.location.pathname !== "/sign-in" &&
      !isRedirectingToSignIn
    ) {
      isRedirectingToSignIn = true;
      window.location.replace("/sign-in");
    }

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
