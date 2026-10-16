import { useCallback } from "react";

import { getBranchInventory, type HqInventoryQuery } from "@/api/inventory";
import { InventoryListView } from "@/components/inventory/inventory-list-view";
import { useSession } from "@/lib/auth-client";

export function BranchInventoryPage() {
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

  return <InventoryListView fetchInventory={fetchInventory} />;
}
