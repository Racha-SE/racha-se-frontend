import { useState } from "react";
import type { SellerRank, SellerSortBy } from "@/api/analytics";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SalesAnalyticsTableProps {
  title: string;
  subtitle: string;
  items: SellerRank[];
  type: "best" | "worst";
  sortBy?: SellerSortBy;
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 5;

export function SalesAnalyticsTable({
  title,
  subtitle,
  items,
  type,
  sortBy = "quantity",
  isLoading = false,
}: SalesAnalyticsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const pageItems = items.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Maximum value for proportional volume bar based on active sort metric
  const maxVal = Math.max(
    ...items.map((item) =>
      sortBy === "revenue" ? item.totalRevenue : item.totalQuantity,
    ),
    1,
  );

  return (
    <section className="space-y-2">
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border/70 bg-card shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="border-border/70 hover:bg-transparent">
              <TableHead className="w-16 border-r border-border/60 px-4 py-3 text-xs font-semibold text-foreground">
                Rank
              </TableHead>
              <TableHead className="border-r border-border/60 px-4 py-3 text-xs font-semibold text-foreground">
                Product
              </TableHead>
              <TableHead className="w-36 border-r border-border/60 px-4 py-3 text-xs font-semibold text-foreground">
                Units sold
              </TableHead>
              <TableHead className="w-36 border-r border-border/60 px-4 py-3 text-xs font-semibold text-foreground">
                Revenue
              </TableHead>
              <TableHead className="w-64 px-4 py-3 text-xs font-semibold text-foreground">
                Volume
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  Loading ranking data...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  No sales data found for this timeframe.
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((item) => {
                const metricVal =
                  sortBy === "revenue" ? item.totalRevenue : item.totalQuantity;
                const isZeroSale = item.totalQuantity === 0;
                const isZeroMetric = metricVal === 0;
                const volumePercent = isZeroMetric
                  ? 0
                  : Math.max(
                      6,
                      Math.min(100, Math.round((metricVal / maxVal) * 100)),
                    );

                return (
                  <TableRow
                    key={item.pId}
                    className="border-border/50 hover:bg-muted/40"
                  >
                    <TableCell className="border-r border-border/60 px-4 py-3.5 text-sm text-foreground">
                      {item.rank}
                    </TableCell>
                    <TableCell className="border-r border-border/60 px-4 py-3.5 text-sm font-medium text-foreground">
                      {item.productName}
                    </TableCell>
                    <TableCell className="border-r border-border/60 px-4 py-3.5 text-sm text-foreground">
                      {isZeroSale ? (
                        <div className="flex items-center gap-2">
                          <span>0</span>
                          <span className="rounded-full border border-orange-200 bg-[#FFF7ED] px-2 py-0.5 text-[11px] font-medium text-[#C2410C]">
                            No sales
                          </span>
                        </div>
                      ) : (
                        item.totalQuantity.toLocaleString()
                      )}
                    </TableCell>
                    <TableCell className="border-r border-border/60 px-4 py-3.5 text-sm text-foreground">
                      ฿ {item.totalRevenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-4 py-3.5">
                      <div className="h-2 w-full max-w-[220px] overflow-hidden rounded-full bg-slate-100">
                        {volumePercent > 0 && (
                          <div
                            className={
                              type === "best"
                                ? "h-full rounded-full bg-focus transition-all duration-300"
                                : "h-full rounded-full bg-[#C2410C] transition-all duration-300"
                            }
                            style={{ width: `${volumePercent}%` }}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-1 pt-1 text-xs text-muted-foreground">
        <span>
          Showing {items.length > 0 ? pageItems.length : 0} of {items.length}{" "}
          Items
        </span>

        {totalPages > 0 && (
          <nav className="flex items-center gap-1" aria-label="Pagination">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="size-7 text-xs"
              disabled={page <= 1 || isLoading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              ‹
            </Button>

            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;
              const isActive = pageNumber === page;

              return (
                <Button
                  key={pageNumber}
                  type="button"
                  variant={isActive ? "default" : "ghost"}
                  size="icon-xs"
                  className={
                    isActive
                      ? "size-7 rounded-full bg-focus text-xs font-semibold text-white shadow-xs"
                      : "size-7 rounded-full text-xs font-normal"
                  }
                  onClick={() => setCurrentPage(pageNumber)}
                  aria-current={isActive ? "page" : undefined}
                >
                  {pageNumber}
                </Button>
              );
            })}

            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="size-7 text-xs"
              disabled={page >= totalPages || isLoading}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              ›
            </Button>
          </nav>
        )}
      </div>
    </section>
  );
}
