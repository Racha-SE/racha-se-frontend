import { useState } from "react";
import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
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

export interface CashierFilterValues {
  category?: string;
}

interface CashierFilterDialogProps {
  categories: readonly { label: string; value: string }[];
  value: CashierFilterValues;
  onApply: (filters: CashierFilterValues) => void;
}

export function CashierFilterDialog({
  categories,
  value,
  onApply,
}: CashierFilterDialogProps) {
  const [open, setOpen] = useState(false);
  const [categoryEnabled, setCategoryEnabled] = useState(
    value.category !== undefined,
  );
  const [category, setCategory] = useState(value.category ?? "");

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setCategoryEnabled(value.category !== undefined);
      setCategory(value.category ?? "");
    }

    setOpen(nextOpen);
  }

  function handleApply() {
    onApply({
      category: categoryEnabled && category ? category : undefined,
    });
    setOpen(false);
  }

  function handleClear() {
    setCategoryEnabled(false);
    setCategory("");
    onApply({});
    setOpen(false);
  }

  return (
    <>
      <Button
        type="button"
        size="lg"
        className="h-9 px-5 text-sm"
        onClick={() => handleOpenChange(true)}
      >
        Filter
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="gap-5 rounded-xl bg-currency-card p-3 sm:max-w-2xl"
          overlayClassName="bg-black/30"
          showCloseButton={false}
        >
          <DialogHeader className="relative rounded-xl bg-surface px-5 py-6">
            <DialogTitle className="text-3xl font-semibold text-active">
              Filter
            </DialogTitle>
            <DialogDescription className="sr-only">
              Filter products by category.
            </DialogDescription>
            <DialogClose
              render={
                <Button
                  variant="ghost"
                  className="absolute top-1/2 right-2 -translate-y-1/2"
                  size="icon-sm"
                />
              }
            >
              <XIcon />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>

          <div className="space-y-3 px-2 pb-2">
            <div className="flex items-center gap-3">
              <Switch
                id="cashier-category-filter-toggle"
                checked={categoryEnabled}
                onCheckedChange={setCategoryEnabled}
              />
              <label
                htmlFor="cashier-category-filter-toggle"
                className="text-sm font-medium"
              >
                Product Category
              </label>
            </div>

            {categoryEnabled && (
              <Select
                items={categories}
                value={category || null}
                onValueChange={(nextValue) => setCategory(nextValue ?? "")}
              >
                <SelectTrigger className="h-9! w-full max-w-[265px] rounded-md bg-surface px-3 text-sm">
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
