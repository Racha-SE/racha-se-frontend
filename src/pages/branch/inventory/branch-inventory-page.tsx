import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { getBranchInventory, type HqInventoryQuery } from "@/api/inventory";
import { InventoryListView } from "@/components/inventory/inventory-list-view";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

export function BranchInventoryPage() {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const branchId = session?.user.branchId;

  const fetchInventory = useCallback(
    (query: HqInventoryQuery = {}) => getBranchInventory(branchId!, query),
    [branchId],
  );

  if (branchId == null) {
    return (
      <p className="p-6 text-sm text-muted-foreground">
        Your account isn't assigned to a branch.
      </p>
    );
  }

  return (
    <InventoryListView
      fetchInventory={fetchInventory}
      headerActions={
        <Button
          type="button"
          size="sm"
          className="h-8 bg-primary text-sm text-primary-foreground hover:bg-active focus-visible:ring-focus/30"
          onClick={() => navigate("/branch/inventory/adjust")}
        >
          Adjust stock
        </Button>
      }
    />
  );
}
