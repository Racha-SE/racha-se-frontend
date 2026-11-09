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

/** Formats an ISO date string (YYYY-MM-DD) to DD/MM/YY. */
export function formatDateToDMY(isoDate: string): string {
  if (!isoDate) return "";
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  const [year, month, day] = parts;
  const shortYear = year.length === 4 ? year.slice(2) : year;
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${shortYear}`;
}

/**
 * Parses user input in DD/MM/YY or DD/MM/YYYY format into an ISO date string (YYYY-MM-DD).
 * Returns null if the format or date is invalid.
 */
export function parseDMYToISO(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  const match = trimmed.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2}|\d{4})$/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  let year = Number(match[3]);

  if (match[3].length === 2) {
    year = 2000 + year;
  }

  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  const y = String(year);
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
