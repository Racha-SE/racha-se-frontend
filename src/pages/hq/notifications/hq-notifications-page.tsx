import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

import { ApiError } from "@/api/client";
import {
  getHqExpireNotifications,
  getHqMinStockNotifications,
  type HqNotification,
} from "@/api/notifications";
import { PaginationControls } from "@/components/pagination-controls";

import { NotificationTable } from "./notification-table";

const itemsPerPage = 10;

export function HqNotificationsPage() {
  const [expireItems, setExpireItems] = useState<HqNotification[]>([]);
  const [expirePage, setExpirePage] = useState(1);
  const [expireTotal, setExpireTotal] = useState(0);
  const [expireTotalPages, setExpireTotalPages] = useState(1);

  const [minStockItems, setMinStockItems] = useState<HqNotification[]>([]);
  const [minStockPage, setMinStockPage] = useState(1);
  const [minStockTotal, setMinStockTotal] = useState(0);
  const [minStockTotalPages, setMinStockTotalPages] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [expire, minStock] = await Promise.all([
          getHqExpireNotifications({
            limit: itemsPerPage,
            offset: (expirePage - 1) * itemsPerPage,
          }),
          getHqMinStockNotifications({
            limit: itemsPerPage,
            offset: (minStockPage - 1) * itemsPerPage,
          }),
        ]);
        if (cancelled) return;

        setExpireItems(expire.result);
        setExpireTotal(expire.total);
        setExpireTotalPages(Math.max(expire.totalPages, 1));

        setMinStockItems(minStock.result);
        setMinStockTotal(minStock.total);
        setMinStockTotalPages(Math.max(minStock.totalPages, 1));
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? "Couldn't load notifications. Please try again."
            : "Something went wrong loading notifications.",
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [expirePage, minStockPage]);

  return (
    <main className="min-h-screen bg-background p-6 text-left text-foreground">
      <header className="flex h-12 items-center gap-3 rounded-md bg-textbox px-3">
        <Bell className="size-4.5 text-sidebar-top" aria-hidden="true" />
        <h1 className="m-0 text-xl font-semibold tracking-normal text-active">
          Notifications
        </h1>
      </header>

      <section className="mt-4 space-y-6 px-2">
        {isLoading ? (
          <p className="px-1 py-6 text-center text-sm text-muted-foreground">
            Loading notifications...
          </p>
        ) : error ? (
          <p className="px-1 py-6 text-center text-sm text-destructive">
            {error}
          </p>
        ) : (
          <>
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                Low stock
              </h2>
              <NotificationTable
                type="min_stock"
                items={minStockItems}
                emptyMessage="No low stock alerts."
              />
              {minStockItems.length > 0 && (
                <div className="flex items-center justify-between text-sm text-foreground">
                  <span>
                    Showing {minStockItems.length} of {minStockTotal} items
                  </span>
                  <PaginationControls
                    page={minStockPage}
                    totalPages={minStockTotalPages}
                    onPageChange={setMinStockPage}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                Expiring soon
              </h2>
              <NotificationTable
                type="expire"
                items={expireItems}
                emptyMessage="No expiring stock."
              />
              {expireItems.length > 0 && (
                <div className="flex items-center justify-between text-sm text-foreground">
                  <span>
                    Showing {expireItems.length} of {expireTotal} items
                  </span>
                  <PaginationControls
                    page={expirePage}
                    totalPages={expireTotalPages}
                    onPageChange={setExpirePage}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
