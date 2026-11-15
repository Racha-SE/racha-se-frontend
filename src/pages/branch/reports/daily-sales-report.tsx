import { useEffect, useState } from "react";

import { exportReport, getReportPreview, type ReportRow } from "@/api/reports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { localISODateDaysAgo } from "@/lib/date";
import { downloadBlob } from "@/lib/download-file";

type ReportFormat = "csv" | "xlsx";

const formatOptions: Array<{ label: string; value: ReportFormat }> = [
  { label: "CSV", value: "csv" },
  { label: "XLSX", value: "xlsx" },
];

function baht(value: number) {
  return `฿${value.toFixed(2)}`;
}

// The /reports endpoint scopes branch accounts to their own branch, so no
// branchId is sent. A "daily" report is just a one-day range.
export function DailySalesReport() {
  const [date, setDate] = useState(() => localISODateDaysAgo(0));
  const [format, setFormat] = useState<ReportFormat>("csv");
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(false);

  useEffect(() => {
    if (!date) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(false);
      try {
        const response = await getReportPreview({
          startDate: date,
          endDate: date,
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
  }, [date]);

  async function handleExport() {
    if (!date) return;
    setIsExporting(true);
    setExportError(false);
    try {
      const { blob, filename } = await exportReport({
        startDate: date,
        endDate: date,
        format,
      });
      downloadBlob(blob, filename ?? `daily_sales_report_${date}.${format}`);
    } catch {
      setExportError(true);
    } finally {
      setIsExporting(false);
    }
  }

  const totals = rows.reduce(
    (sum, row) => ({
      salesQuantity: sum.salesQuantity + row.salesQuantity,
      revenue: sum.revenue + row.revenue,
      cost: sum.cost + row.cost,
      profit: sum.profit + row.profit,
    }),
    { salesQuantity: 0, revenue: 0, cost: 0, profit: 0 },
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-foreground" htmlFor="daily-sales-date">
            Date
          </label>
          <Input
            id="daily-sales-date"
            type="date"
            className="h-8 w-[160px]"
            value={date}
            max={localISODateDaysAgo(0)}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-foreground">Export as</label>
          <Select
            items={formatOptions}
            value={format}
            onValueChange={(value) =>
              setFormat((value as ReportFormat) ?? "csv")
            }
          >
            <SelectTrigger
              className="h-8! w-[120px] rounded-sm bg-surface px-3 text-sm"
              aria-label="Export format"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
              {formatOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            size="sm"
            className="h-8 bg-primary text-sm text-primary-foreground hover:bg-active"
            disabled={!date || isExporting}
            onClick={() => void handleExport()}
          >
            {isExporting ? "Exporting…" : "Export"}
          </Button>
        </div>
      </div>

      {exportError && (
        <p className="text-sm text-destructive">
          Couldn&apos;t export report. Please try again.
        </p>
      )}

      {!date ? (
        <div className="py-10 text-center">Pick a date to see its sales.</div>
      ) : loading ? (
        <div className="py-10 text-center">Loading...</div>
      ) : loadError ? (
        <div className="py-10 text-center text-destructive">
          Couldn&apos;t load report. Please try again.
        </div>
      ) : rows.length === 0 ? (
        <div className="py-10 text-center">No sales on this date.</div>
      ) : (
        <div className="w-fit max-w-full overflow-x-auto border border-border">
          <Table className="w-auto table-fixed">
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="h-auto w-64 border-r border-border px-4 py-2 font-semibold">
                  Product Name
                </TableHead>
                <TableHead className="h-auto w-48 border-r border-border px-4 py-2 font-semibold">
                  Categories
                </TableHead>
                <TableHead className="h-auto w-28 border-r border-border px-4 py-2 text-right font-semibold">
                  Qty Sold
                </TableHead>
                <TableHead className="h-auto w-32 border-r border-border px-4 py-2 text-right font-semibold">
                  Revenue
                </TableHead>
                <TableHead className="h-auto w-32 border-r border-border px-4 py-2 text-right font-semibold">
                  Cost
                </TableHead>
                <TableHead className="h-auto w-32 px-4 py-2 text-right font-semibold">
                  Profit
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.productId}
                  className="border-border even:bg-textbox hover:bg-primary-subtle"
                >
                  <TableCell className="h-auto truncate border-r border-border px-4 py-2">
                    {row.productName}
                  </TableCell>
                  <TableCell className="h-auto truncate border-r border-border px-4 py-2">
                    {row.categories.join(", ") || "—"}
                  </TableCell>
                  <TableCell className="h-auto border-r border-border px-4 py-2 text-right">
                    {row.salesQuantity.toLocaleString()}
                  </TableCell>
                  <TableCell className="h-auto border-r border-border px-4 py-2 text-right">
                    {baht(row.revenue)}
                  </TableCell>
                  <TableCell className="h-auto border-r border-border px-4 py-2 text-right">
                    {baht(row.cost)}
                  </TableCell>
                  <TableCell className="h-auto px-4 py-2 text-right">
                    {baht(row.profit)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="border-border font-semibold hover:bg-transparent">
                <TableCell
                  colSpan={2}
                  className="h-auto border-r border-border px-4 py-2"
                >
                  Total
                </TableCell>
                <TableCell className="h-auto border-r border-border px-4 py-2 text-right">
                  {totals.salesQuantity.toLocaleString()}
                </TableCell>
                <TableCell className="h-auto border-r border-border px-4 py-2 text-right">
                  {baht(totals.revenue)}
                </TableCell>
                <TableCell className="h-auto border-r border-border px-4 py-2 text-right">
                  {baht(totals.cost)}
                </TableCell>
                <TableCell className="h-auto px-4 py-2 text-right">
                  {baht(totals.profit)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      )}
    </div>
  );
}
