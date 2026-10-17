import { ShoppingCart, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { QuantityStepper } from "./quantity-stepper";
import { StockErrorMessage } from "./stock-error-message";
import { validateCartStock, type GetAvailableStock } from "./stock-validation";

export interface CartItem {
  pId: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartIconProps {
  count: number;
}

export function CartIcon({ count }: CartIconProps) {
  return (
    <span className="relative inline-flex text-sidebar-top">
      <ShoppingCart className="size-8" aria-hidden="true" />
      <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-xs text-white">
        {count}
      </span>
    </span>
  );
}

interface CartPanelProps {
  items: CartItem[];
  onQuantityChange: (pId: number, quantity: number) => void;
  onRemove: (pId: number) => void;
  onPayment?: () => void;
  isProcessingPayment?: boolean;
  getAvailable?: GetAvailableStock;
  className?: string;
}

export function CartPanel({
  items,
  onQuantityChange,
  onRemove,
  onPayment,
  isProcessingPayment = false,
  getAvailable = () => undefined,
  className,
}: CartPanelProps) {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const stockIssues = validateCartStock(items, getAvailable);
  const hasAnyExceeded = items.some((item) => {
    const available = getAvailable(item.pId) ?? 0;
    return item.quantity > available;
  });
  const hasStockIssues = stockIssues.length > 0 || hasAnyExceeded;

  return (
    <aside
      className={cn(
        "flex w-[333px] flex-col rounded-lg bg-currency-card p-3 text-sidebar-top",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between rounded-lg bg-textbox px-4 py-4">
        <h2 className="m-0 text-3xl font-semibold text-active">Cart</h2>
        <CartIcon count={itemCount} />
      </div>

      {items.length === 0 ? (
        <p className="m-0 min-h-0 flex-1 px-1 py-6 text-center text-sm text-muted-foreground">
          Your cart is empty.
        </p>
      ) : (
        <ul className="m-0 min-h-0 flex-1 list-none divide-y-2 divide-textbox/60 overflow-y-auto p-0 px-1">
          {items.map((item) => {
            const available = getAvailable(item.pId) ?? 0;
            const isExceeded = item.quantity > available;

            return (
              <li key={item.pId} className="flex flex-col gap-2 py-3">
                <h3 className="m-0 text-lg font-bold">{item.name}</h3>
                <p className="m-0">{item.price.toFixed(2)} ฿</p>
                <div className="flex items-center justify-between">
                  <QuantityStepper
                    value={item.quantity}
                    onChange={(quantity) =>
                      onQuantityChange(item.pId, quantity)
                    }
                    max={available}
                    hasError={isExceeded}
                  />
                  <Button
                    type="button"
                    size="lg"
                    className="h-9 w-[76px]"
                    aria-label={`Remove ${item.name} from cart`}
                    onClick={() => onRemove(item.pId)}
                  >
                    <Trash2 className="size-6 text-sidebar-top" />
                  </Button>
                </div>
                {isExceeded && (
                  <StockErrorMessage message="Product’s exceeding available stocks" />
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-col gap-2 border-t-2 border-textbox/60 px-1 pt-3">
        <div className="flex items-center justify-between text-lg font-bold">
          <span>Total</span>
          <span>{total.toFixed(2)} ฿</span>
        </div>
        <Button
          type="button"
          size="lg"
          disabled={items.length === 0 || isProcessingPayment || hasStockIssues}
          onClick={onPayment}
          className="h-11 self-end px-5 text-base"
        >
          {isProcessingPayment ? "Processing..." : "Payment"}
        </Button>
      </div>
    </aside>
  );
}
