import { useEffect, useState } from "react";

import {
  getBranchInventoryByProduct,
  type BranchInventoryProduct,
} from "@/api/inventory";
import { PaginationControls } from "@/components/pagination-controls";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 20;

type InventoryReportProps = {
  branchId: number;
};

// Current on-hand stock per product at the branch (unexpired lots summed).
export function InventoryReport({ branchId }: InventoryReportProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<BranchInventoryProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setLoadError(false);
      try {
        const response = await getBranchInventoryByProduct(
          branchId,
          {
            search: search.trim() || undefined,
            limit: PAGE_SIZE,
            offset: (page - 1) * PAGE_SIZE,
          },
          { signal: controller.signal },
        );
        if (controller.signal.aborted) return;
        setRows(response.data.inventory);
        setTotalCount(response.data.totalCount);
        setLoading(false);
      } catch {
        if (controller.signal.aborted) return;
        setLoadError(true);
        setLoading(false);
      }
    }

    const timer = setTimeout(() => void load(), 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [branchId, search, page]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <label
            className="text-sm text-foreground"
            htmlFor="inventory-report-search"
          >
            Search
          </label>
          <Input
            id="inventory-report-search"
            type="search"
            placeholder="Product name or barcode"
            className="h-8 w-[260px]"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex items-center gap-3">
          {!loading && !loadError && (
            <span className="text-sm text-muted-foreground">
              {totalCount} product(s)
            </span>
          )}
          {totalPages > 1 && (
            <PaginationControls
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center">Loading...</div>
      ) : loadError ? (
        <div className="py-10 text-center text-destructive">
          Couldn&apos;t load inventory. Please try again.
        </div>
      ) : rows.length === 0 ? (
        <div className="py-10 text-center">
          {search.trim()
            ? "No products match your search."
            : "No products in stock."}
        </div>
      ) : (
        <div className="w-fit max-w-full overflow-x-auto border border-border">
          <Table className="w-auto table-fixed">
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="h-auto w-64 border-r border-border px-4 py-2 font-semibold">
                  Product Name
                </TableHead>
                <TableHead className="h-auto w-40 border-r border-border px-4 py-2 font-semibold">
                  Barcode
                </TableHead>
                <TableHead className="h-auto w-48 border-r border-border px-4 py-2 font-semibold">
                  Categories
                </TableHead>
                <TableHead className="h-auto w-28 border-r border-border px-4 py-2 text-right font-semibold">
                  On Hand
                </TableHead>
                <TableHead className="h-auto w-32 px-4 py-2 text-right font-semibold">
                  Price
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.pId}
                  className="border-border even:bg-textbox hover:bg-primary-subtle"
                >
                  <TableCell className="h-auto truncate border-r border-border px-4 py-2">
                    {row.productName}
                  </TableCell>
                  <TableCell className="h-auto truncate border-r border-border px-4 py-2">
                    {row.barcode}
                  </TableCell>
                  <TableCell className="h-auto truncate border-r border-border px-4 py-2">
                    {row.categories.map((c) => c.categoryName).join(", ") ||
                      "—"}
                  </TableCell>
                  <TableCell className="h-auto border-r border-border px-4 py-2 text-right">
                    {row.quantity.toLocaleString()}
                  </TableCell>
                  <TableCell className="h-auto px-4 py-2 text-right">
                    ฿{row.price.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
