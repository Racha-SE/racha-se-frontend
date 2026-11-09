import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";

import {
  getHqBestSellers,
  getHqWorstSellers,
  type SellerRank,
  type SellerRankingQuery,
  type SellerSortBy,
} from "@/api/analytics";
import { getBranches, type Branch } from "@/api/branch";
import { DatePickerInput } from "@/components/date-picker-input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { localISODateDaysAgo, toLocalISODate, toTimeframe } from "@/lib/date";

import { SalesAnalyticsTable } from "./sales-analytics-table";

type TimeframePreset = "7d" | "30d" | "90d" | "custom";

const defaultEndDate = toLocalISODate(new Date());
const defaultStartDate = localISODateDaysAgo(29);

export function ReportsPage() {
  // Preset selector
  const [preset, setPreset] = useState<TimeframePreset>("30d");

  // Filter form state
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [branchId, setBranchId] = useState("all");
  const [sortBy, setSortBy] = useState<SellerSortBy>("quantity");

  // Applied filter state (only refreshed on mount or when clicking Apply)
  const [appliedRange, setAppliedRange] = useState({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
  });
  const [appliedBranchId, setAppliedBranchId] = useState("all");
  const [appliedSortBy, setAppliedSortBy] = useState<SellerSortBy>("quantity");

  // Data state
  const [branches, setBranches] = useState<Branch[]>([]);
  const [bestSellers, setBestSellers] = useState<SellerRank[]>([]);
  const [worstSellers, setWorstSellers] = useState<SellerRank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load branches list
  useEffect(() => {
    let cancelled = false;
    getBranches()
      .then((res) => {
        if (!cancelled) {
          setBranches(res.data.result);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch analytics rankings when applied filters change
  useEffect(() => {
    let cancelled = false;

    async function loadRankings() {
      setError(null);
      try {
        const { from, to } = toTimeframe(
          appliedRange.startDate,
          appliedRange.endDate,
        );
        const query: SellerRankingQuery = {
          from,
          to,
          sortBy: appliedSortBy,
          limit: 50,
          branchId:
            appliedBranchId === "all" ? undefined : Number(appliedBranchId),
        };

        const [bestRes, worstRes] = await Promise.all([
          getHqBestSellers(query),
          getHqWorstSellers(query),
        ]);

        if (cancelled) return;
        setBestSellers(bestRes.data.result);
        setWorstSellers(worstRes.data.result);
      } catch {
        if (cancelled) return;
        setError("Could not load sales analytics. Please try again.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadRankings();

    return () => {
      cancelled = true;
    };
  }, [appliedRange, appliedBranchId, appliedSortBy]);

  const isRangeValid =
    Boolean(startDate) && Boolean(endDate) && startDate <= endDate;

  function handlePresetChange(nextPreset: TimeframePreset) {
    setPreset(nextPreset);
    const today = toLocalISODate(new Date());

    if (nextPreset === "7d") {
      setStartDate(localISODateDaysAgo(6));
      setEndDate(today);
    } else if (nextPreset === "30d") {
      setStartDate(localISODateDaysAgo(29));
      setEndDate(today);
    } else if (nextPreset === "90d") {
      setStartDate(localISODateDaysAgo(89));
      setEndDate(today);
    }
  }

  function handleDateChange(type: "start" | "end", value: string) {
    setPreset("custom");
    if (type === "start") {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
  }

  function handleApply() {
    if (!isRangeValid) return;
    setIsLoading(true);
    setAppliedRange({ startDate, endDate });
    setAppliedBranchId(branchId);
    setAppliedSortBy(sortBy);
  }

  const branchOptions = [
    { label: "All branches", value: "all" },
    ...branches.map((b) => ({
      label: b.name,
      value: String(b.branchId),
    })),
  ];

  return (
    <main className="min-h-screen bg-background p-6 text-left text-foreground">
      {/* Header bar consistent with other HQ pages */}
      <header className="flex h-12 items-center gap-3 rounded-md bg-textbox px-3">
        <BarChart3 className="size-4.5 text-sidebar-top" aria-hidden="true" />
        <h1 className="m-0 text-xl font-semibold tracking-normal text-active">
          Sales Analytics
        </h1>
      </header>

      <section className="mt-4 space-y-6 px-2">
        {/* Filter Card */}
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs">
          <div className="flex flex-wrap items-end gap-4">
            {/* Timeframe Presets */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Timeframe
              </label>
              <div className="inline-flex rounded-md border border-border/70 bg-background p-0.5">
                <Button
                  type="button"
                  variant={preset === "7d" ? "default" : "ghost"}
                  size="xs"
                  className={
                    preset === "7d"
                      ? "rounded-sm bg-focus font-medium text-white shadow-xs"
                      : "rounded-sm text-foreground hover:bg-muted"
                  }
                  onClick={() => handlePresetChange("7d")}
                >
                  7 days
                </Button>
                <Button
                  type="button"
                  variant={preset === "30d" ? "default" : "ghost"}
                  size="xs"
                  className={
                    preset === "30d"
                      ? "rounded-sm bg-focus font-medium text-white shadow-xs"
                      : "rounded-sm text-foreground hover:bg-muted"
                  }
                  onClick={() => handlePresetChange("30d")}
                >
                  30 days
                </Button>
                <Button
                  type="button"
                  variant={preset === "90d" ? "default" : "ghost"}
                  size="xs"
                  className={
                    preset === "90d"
                      ? "rounded-sm bg-focus font-medium text-white shadow-xs"
                      : "rounded-sm text-foreground hover:bg-muted"
                  }
                  onClick={() => handlePresetChange("90d")}
                >
                  90 days
                </Button>
                <Button
                  type="button"
                  variant={preset === "custom" ? "default" : "ghost"}
                  size="xs"
                  className={
                    preset === "custom"
                      ? "rounded-sm bg-focus font-medium text-white shadow-xs"
                      : "rounded-sm text-foreground hover:bg-muted"
                  }
                  onClick={() => handlePresetChange("custom")}
                >
                  Custom
                </Button>
              </div>
            </div>

            {/* From Date */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="sales-start-date"
                className="text-xs font-medium text-muted-foreground"
              >
                From
              </label>
              <DatePickerInput
                id="sales-start-date"
                value={startDate}
                onChange={(val) => handleDateChange("start", val)}
              />
            </div>

            {/* To Date */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="sales-end-date"
                className="text-xs font-medium text-muted-foreground"
              >
                To
              </label>
              <DatePickerInput
                id="sales-end-date"
                value={endDate}
                onChange={(val) => handleDateChange("end", val)}
              />
            </div>

            {/* Branch Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Branch
              </label>
              <Select
                items={branchOptions}
                value={branchId}
                onValueChange={(val) => setBranchId(val ?? "all")}
              >
                <SelectTrigger
                  className="h-8! w-[180px] rounded-md bg-surface text-xs"
                  aria-label="Filter by branch"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start" alignItemWithTrigger={false}>
                  {branchOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rank By Toggle (Unit / Revenue) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Rank by
              </label>
              <div className="inline-flex rounded-md border border-border/70 bg-background p-0.5">
                <Button
                  type="button"
                  variant={sortBy === "quantity" ? "default" : "ghost"}
                  size="xs"
                  className={
                    sortBy === "quantity"
                      ? "rounded-sm bg-focus font-medium text-white shadow-xs"
                      : "rounded-sm text-foreground hover:bg-muted"
                  }
                  onClick={() => setSortBy("quantity")}
                >
                  Unit
                </Button>
                <Button
                  type="button"
                  variant={sortBy === "revenue" ? "default" : "ghost"}
                  size="xs"
                  className={
                    sortBy === "revenue"
                      ? "rounded-sm bg-focus font-medium text-white shadow-xs"
                      : "rounded-sm text-foreground hover:bg-muted"
                  }
                  onClick={() => setSortBy("revenue")}
                >
                  Revenue
                </Button>
              </div>
            </div>

            {/* Apply Button */}
            <Button
              type="button"
              size="sm"
              className="h-8 rounded-md bg-focus px-5 text-xs font-medium text-white hover:bg-active"
              disabled={!isRangeValid || isLoading}
              onClick={handleApply}
            >
              Apply
            </Button>
          </div>

          {!isRangeValid && (
            <p className="mt-2 text-xs text-destructive">
              End date cannot be earlier than start date.
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Tables Section */}
        <div className="space-y-8">
          <SalesAnalyticsTable
            title="Best sellers"
            subtitle={
              appliedSortBy === "revenue"
                ? "Ranked by revenue, highest first"
                : "Ranked by units sold, highest first"
            }
            items={bestSellers}
            type="best"
            sortBy={appliedSortBy}
            isLoading={isLoading}
          />

          <SalesAnalyticsTable
            title="Worst sellers"
            subtitle={
              appliedSortBy === "revenue"
                ? "Ranked by revenue, lowest first. Products with zero sales rank lowest; ties sorted A-Z."
                : "Ranked by units sold, lowest first. Products with zero sales rank lowest; ties sorted A-Z."
            }
            items={worstSellers}
            type="worst"
            sortBy={appliedSortBy}
            isLoading={isLoading}
          />
        </div>

        {/* Footer sample note */}
        <footer className="text-xs text-muted-foreground">
          Sample data. Both rankings load together on open (default: last 30
          days) and refresh when a timeframe is applied.
        </footer>
      </section>
    </main>
  );
}
