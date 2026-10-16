import { useNavigate } from "react-router-dom";

import { getHqInventory } from "@/api/inventory";
import { InventoryListView } from "@/components/inventory/inventory-list-view";
import { Button } from "@/components/ui/button";

export function InventoryListPage() {
  const navigate = useNavigate();

  return (
    <InventoryListView
      fetchInventory={getHqInventory}
      showGroupToggle
      headerActions={
        <Button
          type="button"
          size="sm"
          className="h-8 bg-primary text-sm text-primary-foreground hover:bg-active focus-visible:ring-focus/30"
          onClick={() => navigate("/hq/orders/new")}
        >
          Add order
        </Button>
      }
    />
  );
}
