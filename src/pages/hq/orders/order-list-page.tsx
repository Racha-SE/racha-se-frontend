import { useState } from "react";
import { PackageOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { mockOrders } from "./mock-orders";
import { OrderTableList } from "./order-table-list";

const blueButtonClassName =
  "h-8 bg-primary text-sm text-primary-foreground hover:bg-active focus-visible:ring-focus/30";

export function OrderListPage() {
  const [search, setSearch] = useState("");

  return (
    <main className="min-h-screen bg-background p-6 text-left text-foreground">
      <header className="flex h-12 items-center gap-3 rounded-md bg-textbox px-3">
        <PackageOpen className="size-4.5 text-sidebar-top" aria-hidden="true" />
        <h1 className="m-0 text-base font-semibold tracking-normal text-active">
          Order
        </h1>
      </header>

      <section className="mt-4 space-y-4 px-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Input
            className="h-8 max-w-[400px] rounded-sm border-border bg-searchbar px-3 text-base text-primary-foreground placeholder:text-primary-foreground/70 focus-visible:border-focus focus-visible:ring-focus/20"
            value={search}
            placeholder="Search order"
            aria-label="Search orders"
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className="flex items-center gap-3">
            <Button type="button" size="sm" className={blueButtonClassName}>
              Add order
            </Button>
            <Button type="button" size="sm" className={blueButtonClassName}>
              Filter
            </Button>
          </div>
        </div>

        <OrderTableList orders={mockOrders} />
      </section>
    </main>
  );
}
