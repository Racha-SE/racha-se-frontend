import type { OrderStatus } from "@/api/orders";
import { Badge } from "@/components/ui/badge";

// Branch-facing names. The backend marks a requisition "completed" once the
// branch confirms receipt, so branch users see that step as "Received".
const labels: Record<OrderStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  completed: "Received",
};

const colors: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-900",
  approved: "bg-emerald-100 text-emerald-900",
  rejected: "bg-red-100 text-red-900",
  completed: "bg-blue-100 text-blue-900",
};

export function RequisitionStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge className={colors[status]}>{labels[status]}</Badge>;
}
