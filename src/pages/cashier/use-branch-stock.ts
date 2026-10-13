import { useCallback, useEffect, useRef, useState } from "react";

import { getBranchStock } from "@/api/inventory";

const DEFAULT_INTERVAL_MS = 15_000;

type UseBranchStockOptions = {
  /** How often to re-fetch while the tab is visible. Defaults to 15s. */
  intervalMs?: number;
  enabled?: boolean;
};

/**
 * Polls a branch's on-hand stock so the POS can validate the cart against it.
 * Polling pauses while the tab is hidden and re-fetches as soon as it's
 * visible again, so a cashier coming back to the tab never sees stale counts.
 *
 * `getAvailable(pId)` returns `undefined` until the first fetch succeeds, then
 * the branch's quantity (0 for a product the branch has never stocked).
 */
export function useBranchStock(
  branchId: number | null | undefined,
  {
    intervalMs = DEFAULT_INTERVAL_MS,
    enabled = true,
  }: UseBranchStockOptions = {},
) {
  const [stock, setStock] = useState<Map<number, number> | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  // Ref rather than state so the poll loop doesn't restart on every fetch.
  const inFlight = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled || branchId == null) return;

    // A newer fetch supersedes an older one still in flight, so a slow
    // response can never overwrite fresher counts.
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;
    setIsFetching(true);

    try {
      const response = await getBranchStock(branchId, {
        signal: controller.signal,
      });
      setStock(
        new Map(
          response.data.result.map((item) => [item.product.pId, item.quantity]),
        ),
      );
      setError(null);
      setLastUpdatedAt(new Date());
    } catch (fetchError) {
      if (controller.signal.aborted) return;
      // Keep the last good counts: a blip in the network shouldn't wipe the
      // cart's stock limits.
      setError(fetchError);
    } finally {
      if (inFlight.current === controller) {
        inFlight.current = null;
        setIsFetching(false);
      }
    }
  }, [branchId, enabled]);

  useEffect(() => {
    if (!enabled || branchId == null) return;

    let timer: ReturnType<typeof setInterval> | undefined;

    const start = () => {
      void refresh();
      timer = setInterval(() => void refresh(), intervalMs);
    };
    const stop = () => {
      clearInterval(timer);
      timer = undefined;
    };
    const onVisibilityChange = () => {
      stop();
      if (document.visibilityState === "visible") start();
    };

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      inFlight.current?.abort();
    };
  }, [branchId, enabled, intervalMs, refresh]);

  // Counts from a different branch are meaningless here, so drop them when
  // the branch changes rather than validating against the wrong shelf.
  const [stockBranchId, setStockBranchId] = useState(branchId);
  if (stockBranchId !== branchId) {
    setStockBranchId(branchId);
    setStock(null);
    setError(null);
    setLastUpdatedAt(null);
  }

  const getAvailable = useCallback(
    (pId: number) => (stock ? (stock.get(pId) ?? 0) : undefined),
    [stock],
  );

  return {
    getAvailable,
    isLoading: stock === null && error === null,
    isFetching,
    error,
    lastUpdatedAt,
    refresh,
  };
}
