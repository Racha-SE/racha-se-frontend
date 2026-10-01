import { useState } from "react";
import { SlidersHorizontal, XIcon } from "lucide-react";

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

export interface ProductFilterValues {
  category?: string;
  isActive?: boolean;
}

interface ProductFilterDialogProps {
  categories: readonly { label: string; value: string }[];
  value: ProductFilterValues;
  onApply: (filters: ProductFilterValues) => void;
}

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
] as const;

export function ProductFilterDialog({
  categories,
  value,
  onApply,
}: ProductFilterDialogProps) {
  const [open, setOpen] = useState(false);
  const [categoryEnabled, setCategoryEnabled] = useState(
    value.category !== undefined,
  );
  const [category, setCategory] = useState(value.category ?? "");
  const [statusEnabled, setStatusEnabled] = useState(
    value.isActive !== undefined,
  );
  const [status, setStatus] = useState<"active" | "inactive">(
    value.isActive === false ? "inactive" : "active",
  );

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setCategoryEnabled(value.category !== undefined);
      setCategory(value.category ?? "");
      setStatusEnabled(value.isActive !== undefined);
      setStatus(value.isActive === false ? "inactive" : "active");
    }

    setOpen(nextOpen);
  }

  function handleApply() {
    onApply({
      category: categoryEnabled && category ? category : undefined,
      isActive: statusEnabled ? status === "active" : undefined,
    });
    setOpen(false);
  }

  function handleClear() {
    setCategoryEnabled(false);
    setCategory("");
    setStatusEnabled(false);
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
        <SlidersHorizontal />
        Filter
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="gap-5 rounded-xl bg-currency-card p-3 sm:max-w-2xl"
          overlayClassName="bg-black/30"
          showCloseButton={false}
        >
          <DialogHeader className="relative rounded-xl bg-surface px-5 py-3">
            <DialogTitle className="text-active">Filter</DialogTitle>
            <DialogDescription className="sr-only">
              Filter products by category and active status.
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

          <div className="grid grid-cols-1 gap-6 px-2 pb-2 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Switch
                  id="category-filter-toggle"
                  checked={categoryEnabled}
                  onCheckedChange={setCategoryEnabled}
                />
                <label
                  htmlFor="category-filter-toggle"
                  className="text-sm font-medium"
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
                  <SelectTrigger className="h-9! w-full rounded-md bg-surface px-3 text-sm">
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
                  id="status-filter-toggle"
                  checked={statusEnabled}
                  onCheckedChange={setStatusEnabled}
                />
                <label
                  htmlFor="status-filter-toggle"
                  className="text-sm font-medium"
                >
                  Status
                </label>
              </div>

              {statusEnabled && (
                <Select
                  items={statusOptions}
                  value={status}
                  onValueChange={(nextValue) => {
                    if (nextValue === "active" || nextValue === "inactive") {
                      setStatus(nextValue);
                    }
                  }}
                >
                  <SelectTrigger className="h-9! w-full rounded-md bg-surface px-3 text-sm">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent align="start" alignItemWithTrigger={false}>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
