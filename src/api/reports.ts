import { apiClient } from "@/api/client";

export type ReportRow = {
  productId: number;
  productName: string;
  categories: string[];
  salesQuantity: number;
  revenue: number;
  cost: number;
  profit: number;
};

export type ReportQuery = {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  branchId?: number; // omit = all branches
};

type ReportPreviewResponse = {
  success: true;
  data: { result: ReportRow[] };
};

function toQueryString(
  query: Record<string, string | number | boolean | undefined>,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const result = params.toString();
  return result ? `?${result}` : "";
}

export function getReportPreview(query: ReportQuery) {
  return apiClient.get<ReportPreviewResponse>(
    `/reports${toQueryString({ ...query, format: "json" })}`,
  );
}

export function exportReport(query: ReportQuery & { format: "csv" | "xlsx" }) {
  return apiClient.getBlob(`/reports${toQueryString(query)}`);
}
