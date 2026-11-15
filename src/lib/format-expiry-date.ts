// Fixed to Thai time, not the viewer's machine: stored expiries are 23:59:59.999 Thai
// time of the expiry day (e.g. 2027-11-17T16:59:59.999Z = 17 Nov), so other zones can shift the day.
export function formatExpiryDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Bangkok" }).format(
    new Date(value),
  );
}
