import { useEffect, useState } from "react";

import {
  getBranchBestSellers,
  type SellerRank,
  type SellerSortBy,
} from "@/api/analytics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toTimeframe } from "@/lib/date";

const sortOptions: Array<{ label: string; value: SellerSortBy }> = [
  { label: "Revenue", value: "revenue" },
  { label: "Quantity sold", value: "quantity" },
];

const limitOptions = [5, 10, 20, 50].map((value) => ({
  label: `Top ${value}`,
  value: String(value),
}));

type TopSellersTableProps = {
  startDate: string;
  endDate: string;
};

export function TopSellersTable({ startDate, endDate }: TopSellersTableProps) {
  const [sortBy, setSortBy] = useState<SellerSortBy>("revenue");
  const [limit, setLimit] = useState("10");
  const [rows, setRows] = useState<SellerRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(false);
      try {
        const response = await getBranchBestSellers({
          ...toTimeframe(startDate, endDate),
          sortBy,
          limit: Number(limit),
        });
        if (!cancelled) setRows(response.data.result);
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
  }, [startDate, endDate, sortBy, limit]);

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="m-0 text-lg font-semibold text-active">
          Top Best Sellers
        </h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-foreground">Rank by</label>
          <Select
            items={sortOptions}
            value={sortBy}
            onValueChange={(value) =>
              setSortBy((value as SellerSortBy) ?? "revenue")
            }
          >
            <SelectTrigger
              className="h-8! w-[150px] rounded-sm bg-surface px-3 text-sm"
              aria-label="Rank by"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            items={limitOptions}
            value={limit}
            onValueChange={(value) => setLimit(value ?? "10")}
          >
            <SelectTrigger
              className="h-8! w-[110px] rounded-sm bg-surface px-3 text-sm"
              aria-label="Number of products"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
              {limitOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center">Loading...</div>
      ) : loadError ? (
        <div className="py-10 text-center text-destructive">
          Couldn&apos;t load best sellers. Please try again.
        </div>
      ) : rows.length === 0 ? (
        <div className="py-10 text-center">No sales in this date range.</div>
      ) : (
        <div className="w-fit max-w-full overflow-x-auto border border-border">
          <Table className="w-auto table-fixed">
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="h-auto w-16 border-r border-border px-4 py-2 text-center font-semibold">
                  Rank
                </TableHead>
                <TableHead className="h-auto w-64 border-r border-border px-4 py-2 font-semibold">
                  Product Name
                </TableHead>
                <TableHead className="h-auto w-48 border-r border-border px-4 py-2 font-semibold">
                  Categories
                </TableHead>
                <TableHead className="h-auto w-32 border-r border-border px-4 py-2 text-right font-semibold">
                  Qty Sold
                </TableHead>
                <TableHead className="h-auto w-36 border-r border-border px-4 py-2 text-right font-semibold">
                  Revenue
                </TableHead>
                <TableHead className="h-auto w-28 px-4 py-2 text-right font-semibold">
                  Orders
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.pId}
                  className="border-border even:bg-textbox hover:bg-primary-subtle"
                >
                  <TableCell className="h-auto border-r border-border px-4 py-2 text-center font-semibold">
                    {row.rank}
                  </TableCell>
                  <TableCell className="h-auto truncate border-r border-border px-4 py-2">
                    <div className="truncate">{row.productName}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {row.barcode}
                    </div>
                  </TableCell>
                  <TableCell className="h-auto truncate border-r border-border px-4 py-2">
                    {row.categories.map((c) => c.categoryName).join(", ") ||
                      "—"}
                  </TableCell>
                  <TableCell className="h-auto border-r border-border px-4 py-2 text-right">
                    {row.totalQuantity.toLocaleString()}
                  </TableCell>
                  <TableCell className="h-auto border-r border-border px-4 py-2 text-right">
                    ฿{row.totalRevenue.toFixed(2)}
                  </TableCell>
                  <TableCell className="h-auto px-4 py-2 text-right">
                    {row.orderCount.toLocaleString()}
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
