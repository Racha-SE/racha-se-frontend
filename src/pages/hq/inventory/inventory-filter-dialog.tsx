import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export type InventorySortBy = "expiryDate" | "costPrice";
export type InventorySortOrder = "asc" | "desc";

export interface InventoryFilterValues {
  category?: string;
  sortBy?: InventorySortBy;
  sortOrder?: InventorySortOrder;
}

interface InventoryFilterDialogProps {
  categories: readonly { label: string; value: string }[];
  value: InventoryFilterValues;
  onApply: (filters: InventoryFilterValues) => void;
}

const sortOptions = [
  { label: "Expiry Date", value: "expiryDate" },
  { label: "Cost Price", value: "costPrice" },
] as const;

const sortOrderOptions = [
  { label: "Ascending", value: "asc" },
  { label: "Descending", value: "desc" },
] as const;

export function InventoryFilterDialog({
  categories,
  value,
  onApply,
}: InventoryFilterDialogProps) {
  const [open, setOpen] = useState(false);
  const [categoryEnabled, setCategoryEnabled] = useState(
    value.category !== undefined,
  );
  const [category, setCategory] = useState(value.category ?? "");
  const [sortEnabled, setSortEnabled] = useState(value.sortBy !== undefined);
  const [sortBy, setSortBy] = useState<InventorySortBy>(
    value.sortBy ?? "expiryDate",
  );
  const [sortOrder, setSortOrder] = useState<InventorySortOrder>(
    value.sortOrder ?? "asc",
  );

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setCategoryEnabled(value.category !== undefined);
      setCategory(value.category ?? "");
      setSortEnabled(value.sortBy !== undefined);
      setSortBy(value.sortBy ?? "expiryDate");
      setSortOrder(value.sortOrder ?? "asc");
    }

    setOpen(nextOpen);
  }

  function handleApply() {
    onApply({
      category: categoryEnabled && category ? category : undefined,
      sortBy: sortEnabled ? sortBy : undefined,
      sortOrder: sortEnabled ? sortOrder : undefined,
    });
    setOpen(false);
  }

  function handleClear() {
    setCategoryEnabled(false);
    setCategory("");
    setSortEnabled(false);
    setSortOrder("asc");
    onApply({});
    setOpen(false);
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        className="h-8 bg-primary text-sm text-primary-foreground hover:bg-active focus-visible:ring-focus/30"
        onClick={() => handleOpenChange(true)}
      >
        Filter
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="gap-5 rounded-xl bg-currency-card p-3 sm:max-w-2xl"
          overlayClassName="bg-black/30"
        >
          <DialogHeader className="rounded-xl bg-surface px-5 py-6">
            <DialogTitle className="text-2xl font-semibold text-active">
              Filter
            </DialogTitle>
            <DialogDescription className="sr-only">
              Filter inventory by category and select its sorting field.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-6 px-2 pb-2 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Switch
                  id="inventory-category-filter-toggle"
                  className="h-8! w-14! [&_[data-slot=switch-thumb]]:size-7!"
                  checked={categoryEnabled}
                  onCheckedChange={setCategoryEnabled}
                />
                <label
                  htmlFor="inventory-category-filter-toggle"
                  className="text-base font-medium"
                >
                  Category
                </label>
              </div>

              {categoryEnabled && (
                <Select
                  items={categories}
                  value={category || null}
                  onValueChange={(nextValue) => setCategory(nextValue ?? "")}
                >
                  <SelectTrigger className="h-10! w-full rounded-md bg-surface px-3 text-base">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent align="start" alignItemWithTrigger={false}>
                    {categories.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Switch
                  id="inventory-sort-toggle"
                  className="h-8! w-14! [&_[data-slot=switch-thumb]]:size-7!"
                  checked={sortEnabled}
                  onCheckedChange={setSortEnabled}
                />
                <label
                  htmlFor="inventory-sort-toggle"
                  className="text-base font-medium"
                >
                  Sort
                </label>
              </div>

              {sortEnabled && (
                <div className="space-y-2">
                  <Select
                    items={sortOptions}
                    value={sortBy}
                    onValueChange={(nextValue) => {
                      if (
                        nextValue === "expiryDate" ||
                        nextValue === "costPrice"
                      ) {
                        setSortBy(nextValue);
                      }
                    }}
                  >
                    <SelectTrigger className="h-10! w-full rounded-md bg-surface px-3 text-base">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent align="start" alignItemWithTrigger={false}>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    items={sortOrderOptions}
                    value={sortOrder}
                    onValueChange={(nextValue) => {
                      if (nextValue === "asc" || nextValue === "desc") {
                        setSortOrder(nextValue);
                      }
                    }}
                  >
                    <SelectTrigger className="h-10! w-full rounded-md bg-surface px-3 text-base">
                      <SelectValue placeholder="Select an order" />
                    </SelectTrigger>
                    <SelectContent align="start" alignItemWithTrigger={false}>
                      {sortOrderOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 px-2 pb-2">
            <Button type="button" variant="outline" onClick={handleClear}>
              Clear
            </Button>
            <Button type="button" onClick={handleApply}>
              Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
