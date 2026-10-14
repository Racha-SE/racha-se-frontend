export function formatBranchDate(value: string) {
  // en-CA formats as YYYY-MM-DD, matching the design.
  return new Date(value).toLocaleDateString("en-CA");
}
