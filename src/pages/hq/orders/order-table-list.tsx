import type { MockOrder } from "./mock-orders";
import { OrderTable } from "./order-table";

interface OrderTableListProps {
  orders: readonly MockOrder[];
  onEditOrder: (orderId: string) => void;
}

export function OrderTableList({ orders, onEditOrder }: OrderTableListProps) {
  return (
    <div className="space-y-5">
      {orders.map((order) => (
        <OrderTable
          key={order.orderId}
          order={order}
          onEditOrder={onEditOrder}
        />
      ))}
    </div>
  );
}
