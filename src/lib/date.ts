/** YYYY-MM-DD in the browser's local time zone. */
export function toLocalISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Local YYYY-MM-DD for `days` days before today (0 = today). */
export function localISODateDaysAgo(days: number): string {
  const today = new Date();
  return toLocalISODate(
    new Date(today.getFullYear(), today.getMonth(), today.getDate() - days),
  );
}

/**
 * Turns an inclusive local date range (YYYY-MM-DD) into the `[from, to)`
 * ISO date-times the analytics API expects: local midnight of the start
 * date up to local midnight of the day after the end date.
 */
export function toTimeframe(startDate: string, endDate: string) {
  const [sy, sm, sd] = startDate.split("-").map(Number);
  const [ey, em, ed] = endDate.split("-").map(Number);
  return {
    from: new Date(sy, sm - 1, sd).toISOString(),
    to: new Date(ey, em - 1, ed + 1).toISOString(),
  };
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
