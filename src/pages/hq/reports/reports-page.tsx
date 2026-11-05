import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";

import { getBranches, type Branch } from "@/api/branch";
import { getReportPreview, exportReport, type ReportRow } from "@/api/reports";
import { downloadBlob } from "@/lib/download-file";
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ReportType = "sales" | "profit";
type ReportFormat = "csv" | "xlsx";

const formatOptions: Array<{ label: string; value: ReportFormat }> = [
  { label: "CSV", value: "csv" },
  { label: "XLSX", value: "xlsx" },
];

function toLocalISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const today = new Date();
const defaultEndDate = toLocalISODate(today);
const defaultStartDate = toLocalISODate(
  new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29),
);

export function ReportsPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [branchId, setBranchId] = useState("all");
  const [format, setFormat] = useState<ReportFormat>("csv");
  const [reportType, setReportType] = useState<ReportType>("sales");

  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(false);

  useEffect(() => {
    getBranches()
      .then((response) => setBranches(response.data.result))
      .catch(() => {});
  }, []);

  const isRangeValid =
    Boolean(startDate) && Boolean(endDate) && startDate <= endDate;
  const selectedBranchId = branchId === "all" ? undefined : Number(branchId);

  const branchOptions = [
    { label: "All Branches", value: "all" },
    ...branches.map((branch) => ({
      label: branch.name,
      value: String(branch.branchId),
    })),
  ];

  useEffect(() => {
    if (!isRangeValid) return;

    let cancelled = false;

    async function loadPreview() {
      setLoading(true);
      setLoadError(false);
      try {
        const response = await getReportPreview({
          startDate,
          endDate,
          branchId: selectedBranchId,
        });
        if (!cancelled) setRows(response.data.result);
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadPreview();

    return () => {
      cancelled = true;
    };
  }, [startDate, endDate, selectedBranchId, isRangeValid]);

  const visibleRows = isRangeValid ? rows : [];
  const isLoading = isRangeValid && loading;
  const hasLoadError = isRangeValid && loadError;

  async function handleExport() {
    if (!isRangeValid) return;
    setIsExporting(true);
    setExportError(false);
    try {
      const { blob, filename } = await exportReport({
        startDate,
        endDate,
        branchId: selectedBranchId,
        format,
      });
      const scope = selectedBranchId
        ? `branch-${selectedBranchId}`
        : "all-branches";
      downloadBlob(
        blob,
        filename ??
          `sales_report_${scope}_${startDate}_to_${endDate}.${format}`,
      );
    } catch {
      setExportError(true);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background p-6 text-left text-foreground">
      <header className="flex h-12 items-center gap-3 rounded-md bg-textbox px-3">
        <BarChart3 className="size-4.5 text-sidebar-top" aria-hidden="true" />
        <h1 className="m-0 text-xl font-semibold tracking-normal text-active">
          Reports
        </h1>
      </header>

      <section className="mt-4 space-y-4 px-2">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label
                className="text-sm text-foreground"
                htmlFor="report-start-date"
              >
                Start date
              </label>
              <Input
                id="report-start-date"
                type="date"
                className="h-8 w-[160px]"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                className="text-sm text-foreground"
                htmlFor="report-end-date"
              >
                End date
              </label>
              <Input
                id="report-end-date"
                type="date"
                className="h-8 w-[160px]"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-foreground">Branch</label>
              <Select
                items={branchOptions}
                value={branchId}
                onValueChange={(value) => setBranchId(value ?? "all")}
              >
                <SelectTrigger
                  className="h-8! w-[204px] rounded-sm bg-surface px-3 text-sm"
                  aria-label="Filter by branch"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start" alignItemWithTrigger={false}>
                  {branchOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="relative flex items-center gap-3 px-3">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 -top-3 -bottom-3 -z-10 rounded-md border border-border bg-textbox"
            />
            <label className="text-sm text-foreground">Export as</label>
            <Select
              items={formatOptions}
              value={format}
              onValueChange={(value) =>
                setFormat((value as ReportFormat) ?? "csv")
              }
            >
              <SelectTrigger
                className="h-8! w-[140px] rounded-sm bg-surface px-3 text-sm"
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
              disabled={!isRangeValid || isExporting}
              onClick={() => void handleExport()}
            >
              {isExporting ? "Exporting…" : "Export"}
            </Button>
          </div>
        </div>

        {!isRangeValid && (
          <p className="text-sm text-destructive">
            End date can&apos;t be before start date.
          </p>
        )}
        {exportError && (
          <p className="text-sm text-destructive">
            Couldn&apos;t export report. Please try again.
          </p>
        )}

        <Tabs
          value={reportType}
          onValueChange={(value) =>
            setReportType((value as ReportType) ?? "sales")
          }
        >
          <TabsList>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="profit">Profit</TabsTrigger>
          </TabsList>

          <TabsContent value="sales">
            {isLoading ? (
              <div className="py-10 text-center">Loading...</div>
            ) : hasLoadError ? (
              <div className="py-10 text-center text-destructive">
                Couldn&apos;t load report. Please try again.
              </div>
            ) : visibleRows.length === 0 ? (
              <div className="py-10 text-center">No data for this range.</div>
            ) : (
              <div className="w-fit border border-border">
                <Table className="w-auto table-fixed">
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="h-auto w-28 border-r border-border px-4 py-2 font-semibold">
                        Product ID
                      </TableHead>
                      <TableHead className="h-auto w-64 border-r border-border px-4 py-2 font-semibold">
                        Product Name
                      </TableHead>
                      <TableHead className="h-auto w-48 border-r border-border px-4 py-2 font-semibold">
                        Categories
                      </TableHead>
                      <TableHead className="h-auto w-36 border-r border-border px-4 py-2 text-right font-semibold">
                        Sales Quantity
                      </TableHead>
                      <TableHead className="h-auto w-36 px-4 py-2 text-right font-semibold">
                        Revenue
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleRows.map((row) => (
                      <TableRow
                        key={row.productId}
                        className="border-border even:bg-textbox hover:bg-primary-subtle"
                      >
                        <TableCell className="h-auto border-r border-border px-4 py-2">
                          {row.productId}
                        </TableCell>
                        <TableCell className="h-auto truncate border-r border-border px-4 py-2">
                          {row.productName}
                        </TableCell>
                        <TableCell className="h-auto truncate border-r border-border px-4 py-2">
                          {row.categories.join(", ") || "—"}
                        </TableCell>
                        <TableCell className="h-auto border-r border-border px-4 py-2 text-right">
                          {row.salesQuantity}
                        </TableCell>
                        <TableCell className="h-auto px-4 py-2 text-right">
                          ฿{row.revenue.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="profit">
            {isLoading ? (
              <div className="py-10 text-center">Loading...</div>
            ) : hasLoadError ? (
              <div className="py-10 text-center text-destructive">
                Couldn&apos;t load report. Please try again.
              </div>
            ) : visibleRows.length === 0 ? (
              <div className="py-10 text-center">No data for this range.</div>
            ) : (
              <div className="w-fit border border-border">
                <Table className="w-auto table-fixed">
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="h-auto w-28 border-r border-border px-4 py-2 font-semibold">
                        Product ID
                      </TableHead>
                      <TableHead className="h-auto w-64 border-r border-border px-4 py-2 font-semibold">
                        Product Name
                      </TableHead>
                      <TableHead className="h-auto w-48 border-r border-border px-4 py-2 font-semibold">
                        Categories
                      </TableHead>
                      <TableHead className="h-auto w-36 border-r border-border px-4 py-2 text-right font-semibold">
                        Cost
                      </TableHead>
                      <TableHead className="h-auto w-36 px-4 py-2 text-right font-semibold">
                        Profit
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleRows.map((row) => (
                      <TableRow
                        key={row.productId}
                        className="border-border even:bg-textbox hover:bg-primary-subtle"
                      >
                        <TableCell className="h-auto border-r border-border px-4 py-2">
                          {row.productId}
                        </TableCell>
                        <TableCell className="h-auto truncate border-r border-border px-4 py-2">
                          {row.productName}
                        </TableCell>
                        <TableCell className="h-auto truncate border-r border-border px-4 py-2">
                          {row.categories.join(", ") || "—"}
                        </TableCell>
                        <TableCell className="h-auto border-r border-border px-4 py-2 text-right">
                          ฿{row.cost.toFixed(2)}
                        </TableCell>
                        <TableCell className="h-auto px-4 py-2 text-right">
                          ฿{row.profit.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
}
