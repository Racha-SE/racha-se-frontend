import { useState } from "react";
import { Boxes } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ProductDetailDialog } from "@/pages/hq/products/product-detail-dialog";
import {
  mockProductCategories,
  mockProducts,
  type MockProduct,
} from "@/pages/hq/products/mock-products";

import { GroupedInventoryGrid } from "./grouped-inventory-grid";
import {
  InventoryFilterDialog,
  type InventoryFilterValues,
} from "./inventory-filter-dialog";
import { InventoryTable } from "./inventory-table";
import { mockGroupedInventory, mockInventory } from "./mock-inventory";

export function InventoryListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [groupByProduct, setGroupByProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MockProduct | null>(
    null,
  );
  const [filters, setFilters] = useState<InventoryFilterValues>({});

  function handleViewProduct(productId: string) {
    const product = mockProducts.find((item) => item.pId === productId);
    setSelectedProduct(product ?? null);
  }

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
              <Switch
                checked={groupByProduct}
                aria-label="Group inventory by product"
                onCheckedChange={setGroupByProduct}
              />
              Group by product
            </label>
            <Button
              type="button"
              size="sm"
              className="h-8 bg-primary text-sm text-primary-foreground hover:bg-active focus-visible:ring-focus/30"
              onClick={() => navigate("/hq/orders/new")}
            >
              Add order
            </Button>
            <InventoryFilterDialog
              categories={mockProductCategories}
              value={filters}
              onApply={setFilters}
            />
          </div>
        </div>

        {groupByProduct ? (
          <GroupedInventoryGrid
            groups={mockGroupedInventory}
            onViewProduct={handleViewProduct}
          />
        ) : (
          <InventoryTable
            items={mockInventory}
            onViewProduct={handleViewProduct}
          />
        )}
      </section>

      <ProductDetailDialog
        product={selectedProduct}
        onOpenChange={(open) => {
          if (!open) setSelectedProduct(null);
        }}
      />
    </main>
  );
}
