import { useState } from "react";
import { Boxes } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

import { InventoryTable } from "./inventory-table";
import { mockInventory } from "./mock-inventory";

const blueButtonClassName =
  "h-8 bg-primary text-sm text-primary-foreground hover:bg-active focus-visible:ring-focus/30";

export function InventoryListPage() {
  const [search, setSearch] = useState("");

  return (
    <main className="min-h-screen bg-background p-6 text-left text-foreground">
      <header className="flex h-12 items-center gap-3 rounded-md bg-textbox px-3">
        <Boxes className="size-4.5 text-sidebar-top" aria-hidden="true" />
        <h1 className="m-0 text-base font-semibold tracking-normal text-active">
          Inventory
        </h1>
      </header>

      <section className="mt-4 space-y-4 px-2">
        <div className="flex items-center justify-between gap-3">
          <Input
            className="h-8 max-w-[400px] rounded-sm border-border bg-searchbar px-3 text-base text-primary-foreground placeholder:text-primary-foreground/70 focus-visible:border-focus focus-visible:ring-focus/20"
            value={search}
            placeholder="Search stock"
            aria-label="Search inventory"
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <Switch defaultChecked aria-label="Show product list" />
              Product list
            </label>
            <Button type="button" size="sm" className={blueButtonClassName}>
              Filter
            </Button>
          </div>
        </div>

        <InventoryTable items={mockInventory} />
      </section>
    </main>
  );
}
