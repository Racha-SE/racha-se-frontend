import type { OrderStatus } from "@/api/orders";
import { Badge } from "@/components/ui/badge";

const labels = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  completed: "Completed",
};

const colors = {
  pending: "bg-amber-100 text-amber-900",
  approved: "bg-emerald-100 text-emerald-900",
  rejected: "bg-red-100 text-red-900",
  completed: "bg-blue-100 text-blue-900",
};

export function RequisitionStatus({ status }: { status: OrderStatus }) {
  return <Badge className={colors[status]}>{labels[status]}</Badge>;
}
