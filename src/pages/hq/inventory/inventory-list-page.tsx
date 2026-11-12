import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getBranches, type Branch } from "@/api/branch";
import {
  getBranchInventory,
  getHqInventory,
  type HqInventoryQuery,
} from "@/api/inventory";
import { InventoryListView } from "@/components/inventory/inventory-list-view";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CombinedStockView } from "./combined-stock-view";

// "all" = every active branch combined, "hq" = HQ warehouse, otherwise a branchId.
export function InventoryListPage() {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [scope, setScope] = useState("all");

  useEffect(() => {
    getBranches()
      .then((response) =>
        setBranches(response.data.result.filter((branch) => branch.isActive)),
      )
      .catch(() => {});
  }, []);

  // Memoized so InventoryListView's fetch effect only re-runs when the scope changes.
  const fetchInventory = useMemo(
    () =>
      scope === "hq"
        ? getHqInventory
        : (query: HqInventoryQuery = {}) =>
            getBranchInventory(Number(scope), query),
    [scope],
  );

  const scopeOptions = [
    { label: "All branches", value: "all" },
    { label: "HQ warehouse", value: "hq" },
    ...branches.map((branch) => ({
      label: branch.name,
      value: String(branch.branchId),
    })),
  ];

  const headerActions = (
    <>
      <Select
        items={scopeOptions}
        value={scope}
        onValueChange={(value) => setScope(value ?? "all")}
      >
        <SelectTrigger
          className="h-8! w-[204px] rounded-sm bg-surface px-3 text-sm"
          aria-label="Select inventory scope"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start" alignItemWithTrigger={false}>
          {scopeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        size="sm"
        className="h-8 bg-primary text-sm text-primary-foreground hover:bg-active focus-visible:ring-focus/30"
        onClick={() => navigate("/hq/orders/new")}
      >
        Add order
      </Button>
    </>
  );

  if (scope === "all") {
    return <CombinedStockView headerActions={headerActions} />;
  }

  return (
    <InventoryListView
      // A new key resets search, filters and page when switching scope.
      key={scope}
      fetchInventory={fetchInventory}
      showGroupToggle={scope === "hq"}
      headerActions={headerActions}
    />
  );
}
