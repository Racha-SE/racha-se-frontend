import { useState } from "react";
import {
  Banknote,
  CircleAlert,
  CreditCard,
  QrCode,
  ShoppingCart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { isInsufficientStockError } from "@/api/client";
import { confirmCustomerOrderPayment, createCustomerOrder } from "@/api/orders";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import { useCart, type CartItem } from "./cart-context";
import {
  StockConflictDialog,
  type StockConflictItem,
} from "./stock-conflict-dialog";
import { useBranchStock } from "./use-branch-stock";

export function PaymentPage() {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const branchId = session?.user.branchId;
  const { cartItems, totalAmount, setCartItems, clearCart } = useCart();
  const { refresh: refreshStock } = useBranchStock(branchId);

  const [selectedMethod, setSelectedMethod] = useState<"cash" | "qr" | null>(
    null,
  );
  const [showError, setShowError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictItems, setConflictItems] = useState<StockConflictItem[]>([]);
  const [isConflictOpen, setIsConflictOpen] = useState(false);

  const handleSelectMethod = (method: "cash" | "qr") => {
    setSelectedMethod(method);
    setShowError(false);
  };

  const handleConfirmPayment = async () => {
    if (cartItems.length === 0) {
      navigate("/cashier");
      return;
    }

    if (!selectedMethod) {
      setShowError(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Fresh stock pre-check
      const freshStock = await refreshStock();
      if (freshStock) {
        const conflicts: StockConflictItem[] = [];
        for (const item of cartItems) {
          const available = freshStock.get(item.pId) ?? 0;
          if (item.quantity > available) {
            conflicts.push({
              pId: item.pId,
              productName: item.name,
              requested: item.quantity,
              available: Math.max(0, available),
            });
          }
        }

        if (conflicts.length > 0) {
          setConflictItems(conflicts);
          setIsConflictOpen(true);
          return;
        }
      }

      // 2. Submit order creation
      const response = await createCustomerOrder({
        paymentMethod: selectedMethod,
        items: cartItems.map((item) => ({
          pId: item.pId,
          quantity: item.quantity,
        })),
      });

      // If QR payment, confirm payment directly per requirement
      if (selectedMethod === "qr" && response.data?.lotId) {
        try {
          await confirmCustomerOrderPayment(response.data.lotId);
        } catch {
          // Continue if confirm fails or was already handled
        }
      }

      // Success
      clearCart();
      await refreshStock();
      navigate("/cashier/order-lists");
    } catch (err) {
      if (isInsufficientStockError(err)) {
        const latestStock = await refreshStock();
        const pId = err.body.error.context?.pId;
        const requested = err.body.error.context?.requested;
        const availableAmount = err.body.error.context?.availableAmount;

        const raceConflicts: StockConflictItem[] = [];
        for (const item of cartItems) {
          const avail = latestStock
            ? (latestStock.get(item.pId) ?? 0)
            : item.pId === pId && typeof availableAmount === "number"
              ? availableAmount
              : item.quantity;

          if (item.quantity > avail) {
            raceConflicts.push({
              pId: item.pId,
              productName: item.name,
              requested: item.quantity,
              available: Math.max(0, avail),
            });
          }
        }

        if (raceConflicts.length === 0 && typeof pId === "number") {
          const matchedItem = cartItems.find((i) => i.pId === pId);
          raceConflicts.push({
            pId,
            productName: matchedItem?.name ?? `Product #${pId}`,
            requested:
              typeof requested === "number"
                ? requested
                : (matchedItem?.quantity ?? 1),
            available:
              typeof availableAmount === "number"
                ? Math.max(0, availableAmount)
                : 0,
          });
        }

        setConflictItems(raceConflicts);
        setIsConflictOpen(true);
      } else {
        console.error("Payment submission failed", err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdjustCart = () => {
    const conflictMap = new Map(conflictItems.map((c) => [c.pId, c.available]));

    setCartItems((current) =>
      current
        .map((item) => {
          if (!conflictMap.has(item.pId)) return item;
          const available = conflictMap.get(item.pId)!;
          return available > 0 ? { ...item, quantity: available } : null;
        })
        .filter((item): item is CartItem => item !== null),
    );

    setIsConflictOpen(false);
  };

  const handleBackToCart = () => {
    setIsConflictOpen(false);
    navigate("/cashier");
  };

  return (
    <main className="min-h-screen bg-background p-6 text-left text-foreground">
      <header className="flex h-12 items-center gap-3 rounded-md bg-textbox px-3">
        <ShoppingCart
          className="size-4.5 text-sidebar-top"
          aria-hidden="true"
        />
        <h1 className="m-0 text-xl font-semibold tracking-normal text-active">
          POS
        </h1>
      </header>

      <section className="mt-4 space-y-5">
        <h2 className="m-0 text-2xl font-bold tracking-tight text-active">
          Payment
        </h2>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_360px]">
          <div className="overflow-hidden rounded-lg border border-border/60 bg-white">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-border/60">
                <tr>
                  <th className="p-4 font-bold text-sidebar-top">Product</th>
                  <th className="p-4 font-bold text-sidebar-top">Unit Price</th>
                  <th className="p-4 font-bold text-sidebar-top">Quantity</th>
                  <th className="p-4 font-bold text-sidebar-top">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {cartItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-8 text-center text-sm text-muted-foreground"
                    >
                      No items in cart.
                    </td>
                  </tr>
                ) : (
                  cartItems.map((item) => (
                    <tr key={item.pId}>
                      <td className="p-4 text-sidebar-top">{item.name}</td>
                      <td className="p-4 text-sidebar-top">
                        {item.price.toFixed(2)} ฿
                      </td>
                      <td className="p-4 text-sidebar-top">{item.quantity}</td>
                      <td className="p-4 text-sidebar-top">
                        {(item.price * item.quantity).toFixed(2)} ฿
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-between bg-[#dce3ec] px-4 py-3 text-base font-bold text-sidebar-top">
              <span>Total</span>
              <span>{totalAmount.toFixed(2)} ฿</span>
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-white p-6">
            <div className="flex items-center gap-2">
              <CreditCard className="size-5 text-sidebar-top" />
              <h3 className="m-0 text-base font-bold text-sidebar-top">
                Payment Method
              </h3>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div
                role="radio"
                aria-checked={selectedMethod === "cash"}
                tabIndex={0}
                className={cn(
                  "relative flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border p-4 text-center transition-all",
                  selectedMethod === "cash"
                    ? "border-2 border-focus bg-blue-50/20"
                    : "border-border/80 hover:border-border",
                )}
                onClick={() => handleSelectMethod("cash")}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    handleSelectMethod("cash");
                  }
                }}
              >
                <div className="absolute top-2.5 right-2.5 flex size-4 items-center justify-center rounded-full border border-border">
                  {selectedMethod === "cash" && (
                    <div className="size-2 rounded-full bg-focus" />
                  )}
                </div>

                <div className="flex size-9 items-center justify-center rounded-md bg-textbox text-sidebar-top">
                  <Banknote className="size-5" />
                </div>
                <span className="text-sm font-bold text-sidebar-top">Cash</span>
                <span className="text-xs text-muted-foreground">
                  Pay with cash
                </span>
              </div>

              <div
                role="radio"
                aria-checked={selectedMethod === "qr"}
                tabIndex={0}
                className={cn(
                  "relative flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border p-4 text-center transition-all",
                  selectedMethod === "qr"
                    ? "border-2 border-focus bg-blue-50/20"
                    : "border-border/80 hover:border-border",
                )}
                onClick={() => handleSelectMethod("qr")}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    handleSelectMethod("qr");
                  }
                }}
              >
                <div className="absolute top-2.5 right-2.5 flex size-4 items-center justify-center rounded-full border border-border">
                  {selectedMethod === "qr" && (
                    <div className="size-2 rounded-full bg-focus" />
                  )}
                </div>

                <div className="flex size-9 items-center justify-center rounded-md bg-textbox text-sidebar-top">
                  <QrCode className="size-5" />
                </div>
                <span className="text-sm font-bold text-sidebar-top">
                  QR Payment
                </span>
                <span className="text-xs text-muted-foreground">
                  Pay via QR code
                </span>
              </div>
            </div>

            {showError && (
              <div className="mt-3 flex items-center gap-1.5 text-xs font-normal text-base-red-bright">
                <CircleAlert className="size-4 shrink-0 text-base-red-bright" />
                <span>Select a Payment Method to continue</span>
              </div>
            )}

            <div className="mt-6 flex items-center gap-3">
              <Button
                type="button"
                className="h-9 rounded-md bg-primary px-5 text-sm font-medium text-white hover:bg-primary/90"
                onClick={() => navigate("/cashier")}
              >
                Back
              </Button>
              <Button
                type="button"
                className="h-9 rounded-md bg-primary px-5 text-sm font-medium text-white hover:bg-primary/90"
                disabled={isSubmitting || cartItems.length === 0}
                onClick={() => void handleConfirmPayment()}
              >
                {isSubmitting ? "Processing..." : "Confirm Payment"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <StockConflictDialog
        open={isConflictOpen}
        onOpenChange={setIsConflictOpen}
        conflicts={conflictItems}
        onBackToCart={handleBackToCart}
        onAdjustCart={handleAdjustCart}
      />
    </main>
  );
}
