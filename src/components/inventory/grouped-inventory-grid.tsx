import { useState } from "react";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";

import { InventoryLotTable } from "./inventory-lot-table";
import type {
  InventoryProduct,
  InventoryProductGroup,
} from "./inventory-types";
import { ProductInventoryLotsDialog } from "./product-inventory-lots-dialog";

const visibleLotCount = 4;

interface GroupedInventoryGridProps {
  groups: readonly InventoryProductGroup[];
  onViewProduct: (product: InventoryProduct) => void;
}

export function GroupedInventoryGrid({
  groups,
  onViewProduct,
}: GroupedInventoryGridProps) {
  const [selectedGroup, setSelectedGroup] =
    useState<InventoryProductGroup | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {groups.map((group) => {
          const visibleItems = group.items.slice(0, visibleLotCount);
          const emptyRows = Math.max(visibleLotCount - visibleItems.length, 0);

          return (
            <section
              key={group.productId}
              className="overflow-hidden rounded-md border border-border bg-surface"
            >
              <header className="flex min-h-16 items-center justify-between gap-3 border-b border-border bg-textbox px-4 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <h2 className="truncate text-base font-semibold text-active">
                      {group.productName}
                    </h2>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="shrink-0 text-foreground [&_svg]:size-3.5!"
                      aria-label={`View ${group.productName} details`}
                      onClick={() => onViewProduct(group)}
                    >
                      <Eye />
                    </Button>
                  </div>
                  <p className="text-sm text-foreground">
                    {group.productId} · {group.category}
                  </p>
                </div>

                {group.items.length > visibleLotCount && (
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto shrink-0 px-0 text-sm text-primary"
                    onClick={() => setSelectedGroup(group)}
                  >
                    View all ({group.items.length})
                  </Button>
                )}
              </header>

              <InventoryLotTable items={visibleItems} emptyRows={emptyRows} />
            </section>
          );
        })}
      </div>

      {selectedGroup && (
        <ProductInventoryLotsDialog
          open
          onOpenChange={(open) => {
            if (!open) setSelectedGroup(null);
          }}
          productName={selectedGroup.productName}
          productId={selectedGroup.productId}
          items={selectedGroup.items}
        />
      )}
    </>
  );
}
