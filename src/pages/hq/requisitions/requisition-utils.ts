import { ApiError, isInsufficientStockError } from "@/api/client";

export function requisitionError(error: unknown) {
  if (isInsufficientStockError(error)) {
    const context = error.body.error.context;

    return `Insufficient HQ stock${
      context?.pId ? ` for product #${context.pId}` : ""
    }. Refresh the request to review availability.`;
  }

  if (error instanceof ApiError) {
    if (error.status === 400) {
      return "The request could not be processed. Check its current status and try again.";
    }

    if (error.status === 403) {
      return "You do not have permission to perform this action.";
    }

    if (error.status === 404) {
      return "Requisition not found.";
    }

    if (error.status === 401) {
      return "Your session has expired. Please sign in again.";
    }

    return "The server could not process the request. Please try again.";
  }

  return error instanceof Error
    ? error.message
    : "Unable to load requisitions. Please try again.";
}

export function requisitionDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("en-GB");
}
