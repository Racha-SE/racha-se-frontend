export type StockIssueKind = "out-of-stock" | "insufficient-stock";

export type StockIssue = {
  pId: number;
  kind: StockIssueKind;
  requested: number;
  available: number;
};

type CartLine = {
  pId: number;
  quantity: number;
};

/**
 * `undefined` means the stock isn't known yet (first fetch still in flight or
 * failed), which the checks below treat as "don't block".
 */
export type GetAvailableStock = (pId: number) => number | undefined;

/** One issue per cart line whose quantity is more than the branch has. */
export function validateCartStock(
  items: CartLine[],
  getAvailable: GetAvailableStock,
): StockIssue[] {
  const issues: StockIssue[] = [];

  for (const item of items) {
    const available = getAvailable(item.pId);
    if (available === undefined || item.quantity <= available) continue;

    issues.push({
      pId: item.pId,
      kind: available <= 0 ? "out-of-stock" : "insufficient-stock",
      requested: item.quantity,
      available,
    });
  }

  return issues;
}

/**
 * How many more units of a product can go into the cart, given what's already
 * in it. `Infinity` while the stock isn't known yet.
 */
export function getRemainingAddable(
  pId: number,
  quantityInCart: number,
  getAvailable: GetAvailableStock,
) {
  const available = getAvailable(pId);
  if (available === undefined) return Infinity;

  return Math.max(available - quantityInCart, 0);
}
