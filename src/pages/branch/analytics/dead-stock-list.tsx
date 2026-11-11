import { useEffect, useState } from "react";

import { getBranchDeadStock, type DeadStockItem } from "@/api/analytics";
import { PaginationControls } from "@/components/pagination-controls";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, toTimeframe } from "@/lib/date";

const PAGE_SIZE = 20;

type DeadStockListProps = {
  startDate: string;
  endDate: string;
};

export function DeadStockList({ startDate, endDate }: DeadStockListProps) {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<DeadStockItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Back to the first page whenever the date range changes.
  const [prevRange, setPrevRange] = useState(`${startDate}|${endDate}`);
  const range = `${startDate}|${endDate}`;
  if (range !== prevRange) {
    setPrevRange(range);
    setPage(1);
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(false);
      try {
        const response = await getBranchDeadStock({
          ...toTimeframe(startDate, endDate),
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
        });
        if (!cancelled) {
          setRows(response.data.result);
          setTotalCount(response.data.totalCount);
        }
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [startDate, endDate, page]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="m-0 text-lg font-semibold text-active">Dead Stock</h2>
          <p className="m-0 text-sm text-muted-foreground">
            Products in stock with no sales in this date range
            {!loading && !loadError && ` · ${totalCount} item(s)`}
          </p>
        </div>
        {totalPages > 1 && (
          <PaginationControls
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>

      {loading ? (
        <div className="py-10 text-center">Loading...</div>
      ) : loadError ? (
        <div className="py-10 text-center text-destructive">
          Couldn&apos;t load dead stock. Please try again.
        </div>
      ) : rows.length === 0 ? (
        <div className="py-10 text-center">
          No dead stock in this date range.
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
                <TableHead className="h-auto w-48 px-4 py-2 font-semibold">
                  Last Sold
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
                    {row.onHandQuantity.toLocaleString()}
                  </TableCell>
                  <TableCell className="h-auto px-4 py-2">
                    {row.lastSoldAt ? (
                      formatDateTime(row.lastSoldAt)
                    ) : (
                      <span className="text-muted-foreground">Never sold</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
