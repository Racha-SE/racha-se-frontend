import { ApiError, isInsufficientStockError } from "@/api/client";

export function requisitionError(
  error: unknown,
  fallback = "Unable to load requisitions. Please try again.",
) {
  if (isInsufficientStockError(error)) {
    const context = error.body.error.context;

    return `Insufficient HQ stock${
      context?.pId ? ` for product #${context.pId}` : ""
    }. The requested quantities cannot be approved.`;
  }

  if (error instanceof ApiError) {
    if (error.status === 400) {
      return "The requisition could not be processed. Its status may have changed. Reload its details before making another decision.";
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

    if (error.status === 409) {
      return "The requisition conflicts with the current action. Reload its details before making another decision.";
    }

    if (error.status === 422) {
      return "The submitted data is invalid. Check the form and try again.";
    }
  }

  return fallback;
}

export function requisitionDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("en-GB");
}
