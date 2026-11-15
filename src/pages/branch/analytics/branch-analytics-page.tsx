import { useState } from "react";
import { TrendingUp } from "lucide-react";

import { Input } from "@/components/ui/input";
import { localISODateDaysAgo } from "@/lib/date";
import { useSession } from "@/lib/auth-client";
import { DeadStockList } from "./dead-stock-list";
import { TopSellersTable } from "./top-sellers-table";

export function BranchAnalyticsPage() {
  const { data: session } = useSession();
  const [startDate, setStartDate] = useState(() => localISODateDaysAgo(29));
  const [endDate, setEndDate] = useState(() => localISODateDaysAgo(0));

  const isRangeValid =
    Boolean(startDate) && Boolean(endDate) && startDate <= endDate;

  if (session && session.user.branchId == null) {
    return (
      <p className="p-6 text-sm text-muted-foreground">
        Your account isn&apos;t assigned to a branch.
      </p>
    );
  }

  return (
    <main className="min-h-screen bg-background p-6 text-left text-foreground">
      <header className="flex h-12 items-center gap-3 rounded-md bg-textbox px-3">
        <TrendingUp className="size-4.5 text-sidebar-top" aria-hidden="true" />
        <h1 className="m-0 text-xl font-semibold tracking-normal text-active">
          Branch Analytics
        </h1>
      </header>

      <section className="mt-4 space-y-6 px-2">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label
              className="text-sm text-foreground"
              htmlFor="analytics-start-date"
            >
              Start date
            </label>
            <Input
              id="analytics-start-date"
              type="date"
              className="h-8 w-[160px]"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              className="text-sm text-foreground"
              htmlFor="analytics-end-date"
            >
              End date
            </label>
            <Input
              id="analytics-end-date"
              type="date"
              className="h-8 w-[160px]"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
        </div>

        {isRangeValid ? (
          <>
            <TopSellersTable startDate={startDate} endDate={endDate} />
            <DeadStockList startDate={startDate} endDate={endDate} />
          </>
        ) : (
          <p className="text-sm text-destructive">
            End date can&apos;t be before start date.
          </p>
        )}
      </section>
    </main>
  );
}
