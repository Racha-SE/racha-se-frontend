import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

import { ApiError } from "@/api/client";
import {
  getBranchExpireNotifications,
  getBranchMinStockNotifications,
  type StockAlert,
} from "@/api/notifications";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/auth-client";

import { AlertSummaryCard } from "./alert-summary-card";
import { StockAlertTable } from "./stock-alert-table";

const alertTabs = [
  { value: "all", label: "All alerts", emptyMessage: "No open alerts." },
  {
    value: "min_stock",
    label: "Low stock",
    emptyMessage: "No low stock alerts.",
  },
  {
    value: "expire",
    label: "Expiring soon",
    emptyMessage: "No expiring stock.",
  },
] as const;

type AlertTab = (typeof alertTabs)[number]["value"];

export function BranchNotificationsPage() {
  const { data: session } = useSession();
  const branchId = session?.user.branchId;
  const [expireItems, setExpireItems] = useState<StockAlert[]>([]);
  const [minStockItems, setMinStockItems] = useState<StockAlert[]>([]);
  const [expireTotal, setExpireTotal] = useState(0);
  const [minStockTotal, setMinStockTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AlertTab>("all");

  useEffect(() => {
    if (branchId == null) return;
    let cancelled = false;

    async function load(branchId: number) {
      setIsLoading(true);
      setError(null);
      try {
        const [expire, minStock] = await Promise.all([
          getBranchExpireNotifications(branchId),
          getBranchMinStockNotifications(branchId),
        ]);
        if (cancelled) return;
        setExpireItems(expire.result);
        setExpireTotal(expire.total);
        setMinStockItems(minStock.result);
        setMinStockTotal(minStock.total);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? "Couldn't load stock alerts. Please try again."
            : "Something went wrong loading stock alerts.",
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load(branchId);

    return () => {
      cancelled = true;
    };
  }, [branchId]);

  const allItems = [...minStockItems, ...expireItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const visibleItems =
    activeTab === "all"
      ? allItems
      : allItems.filter((item) => item.type === activeTab);
  const emptyMessage =
    alertTabs.find((tab) => tab.value === activeTab)?.emptyMessage ?? "";

  if (branchId == null) {
    return (
      <p className="p-6 text-sm text-muted-foreground">
        Your account isn't assigned to a branch.
      </p>
    );
  }

  return (
    <main className="min-h-screen bg-background p-6 text-left text-foreground">
      <header className="flex h-12 items-center gap-3 rounded-md bg-textbox px-3">
        <Bell className="size-4.5 text-sidebar-top" aria-hidden="true" />
        <h1 className="m-0 text-xl font-semibold tracking-normal text-active">
          Notifications
        </h1>
      </header>

      <section className="mt-4 space-y-4 px-2">
        <div>
          <h2 className="m-0 text-xl font-semibold text-active">
            Stock alerts
          </h2>
          <p className="m-0 mt-1 text-xs text-muted-foreground">
            Products at your branch that are running low or close to expiry.
          </p>
        </div>

        {isLoading ? (
          <p className="px-1 py-6 text-center text-sm text-muted-foreground">
            Loading stock alerts...
          </p>
        ) : error ? (
          <p className="px-1 py-6 text-center text-sm text-destructive">
            {error}
          </p>
        ) : (
          <>
            <div className="grid max-w-3xl grid-cols-3 gap-3">
              <AlertSummaryCard
                label="All open alerts"
                value={minStockTotal + expireTotal}
              />
              <AlertSummaryCard
                label="Low stock"
                value={minStockTotal}
                valueClassName="text-amber-700"
              />
              <AlertSummaryCard
                label="Expiring soon"
                value={expireTotal}
                valueClassName="text-active"
              />
            </div>

            <div className="space-y-2">
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as AlertTab)}
              >
                <TabsList className="h-auto gap-0 rounded-md border border-border bg-background p-0">
                  {alertTabs.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="h-auto rounded-none px-4 py-1.5 text-xs first:rounded-l-md last:rounded-r-md data-active:bg-primary data-active:text-primary-foreground data-active:shadow-none"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <StockAlertTable
                items={visibleItems}
                emptyMessage={emptyMessage}
              />

              {visibleItems.length > 0 && (
                <p className="m-0 text-xs text-muted-foreground">
                  Showing {visibleItems.length}{" "}
                  {visibleItems.length === 1 ? "alert" : "alerts"}
                </p>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
