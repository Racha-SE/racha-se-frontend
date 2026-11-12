import { useNavigate } from "react-router-dom";

import type { BranchOrder } from "@/api/orders-branch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

import { formatOrderId } from "./branch-order-format";
import { BranchOrderInfo } from "./branch-order-info";

interface BranchOrderItemsDialogProps {
  /** The order to show; `null` keeps the dialog closed. */
  order: BranchOrder | null;
  branchName: string;
  onOpenChange: (open: boolean) => void;
}

export function BranchOrderItemsDialog({
  order,
  branchName,
  onOpenChange,
}: BranchOrderItemsDialogProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={order !== null} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-sidebar-top/40"
        className="gap-2 p-[30px] sm:max-w-[640px]"
      >
        {order && (
          <>
            <DialogTitle className="text-2xl font-semibold">
              Order {formatOrderId(order.lotId)}
            </DialogTitle>
            <DialogDescription className="text-base text-sidebar-bottom">
              {branchName} · {order.status}
            </DialogDescription>

            <BranchOrderInfo order={order} />

            <Button
              type="button"
              variant="outline"
              className="mt-2 self-end"
              onClick={() => navigate(`/branch/orders/details/${order.lotId}`)}
            >
              View full details
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
