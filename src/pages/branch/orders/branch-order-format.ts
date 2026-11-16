export function formatOrderId(lotId: number) {
  return `O${String(lotId).padStart(4, "0")}`;
}

export function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString("en-GB") : "-";
}
