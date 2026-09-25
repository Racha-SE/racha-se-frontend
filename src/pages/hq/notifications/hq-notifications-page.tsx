import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

import { ApiError } from "@/api/client";
import {
  getHqExpireNotifications,
  getHqMinStockNotifications,
  type HqNotification,
} from "@/api/notifications";
import { getProductById } from "@/api/product";

import { NotificationTable } from "./notification-table";

export function HqNotificationsPage() {
  const [expireItems, setExpireItems] = useState<HqNotification[]>([]);
  const [minStockItems, setMinStockItems] = useState<HqNotification[]>([]);
  const [productNames, setProductNames] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [expire, minStock] = await Promise.all([
          getHqExpireNotifications(),
          getHqMinStockNotifications(),
        ]);
        if (cancelled) return;
        setExpireItems(expire);
        setMinStockItems(minStock);

        const uniquePIds = [
          ...new Set([...expire, ...minStock].map((item) => item.pId)),
        ];
        const nameEntries = await Promise.all(
          uniquePIds.map(async (pId) => {
            try {
              const response = await getProductById(pId);
              return [pId, response.data.name] as const;
            } catch {
              return null;
            }
          }),
        );
        if (cancelled) return;
        setProductNames(
          Object.fromEntries(nameEntries.filter((entry) => entry !== null)),
        );
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

    load();

    return () => {
      cancelled = true;
    };
  }, []);

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
                productNames={productNames}
                emptyMessage="No low stock alerts."
              />
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                Expiring soon
              </h2>
              <NotificationTable
                type="expire"
                items={expireItems}
                productNames={productNames}
                emptyMessage="No expiring stock."
              />
            </div>
          </>
        )}
      </section>
    </main>
  );
}
