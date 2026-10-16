import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { getBranches, type Branch } from "@/api/branch";
import {
  getAllBranchStock,
  type BranchInventoryProduct,
} from "@/api/inventory";
import { getCustomerOrderById, type CustomerOrder } from "@/api/orders";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

function formatOrderDateTime(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const day = d.getDate();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day} ${month} ${year} , ${hours}:${minutes}`;
  } catch {
    return dateStr;
  }
}

export function OrderDetailsPage() {
  const navigate = useNavigate();
  const { lotId } = useParams<{ lotId: string }>();
  const { data: session } = useSession();
  const branchId = session?.user.branchId;

  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<BranchInventoryProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBranches() {
      try {
        const branchRes = await getBranches();
        setBranches(branchRes.data.result);
      } catch {
        // Fallback gracefully
      }
    }

    void loadBranches();
  }, []);

  const activeBranchId = branchId ?? order?.items[0]?.branchId;

  useEffect(() => {
    if (activeBranchId == null) return;

    async function loadStock(bId: number) {
      try {
        const stock = await getAllBranchStock(bId);
        setProducts(stock);
      } catch {
        // Fallback gracefully
      }
    }

    void loadStock(activeBranchId);
  }, [activeBranchId]);

  useEffect(() => {
    if (!lotId) return;

    async function loadOrder(orderLotId: number) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getCustomerOrderById(orderLotId);
        setOrder(response.data);
      } catch (err) {
        console.error("Failed to load order detail", err);
        setError("Failed to load order details.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadOrder(Number(lotId));
  }, [lotId]);

  const branchNameMap = new Map<number, string>(
    branches.map((b) => [b.branchId, b.name]),
  );
  const productNameMap = new Map<number, string>(
    products.map((p) => [p.pId, p.productName]),
  );

  const targetBranchId =
    order?.branchId ?? order?.items[0]?.branchId ?? branchId;
  const branchName =
    (targetBranchId != null ? branchNameMap.get(targetBranchId) : undefined) ??
    branches.find((b) => b.branchId === targetBranchId)?.name ??
    (targetBranchId != null ? `Branch #${targetBranchId}` : "-");

  const cashierDisplayName =
    session?.user.firstname ||
    session?.user.name ||
    session?.user.username ||
    "Raisenx";

  const totalQuantity =
    order?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const totalAmount =
    order?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) ??
    0;

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
          Order Detail
        </h2>

        {isLoading ? (
          <div className="rounded-lg border border-border/60 bg-white p-8 text-center text-sm text-muted-foreground">
            Loading order details...
          </div>
        ) : error || !order ? (
          <div className="rounded-lg border border-border/60 bg-white p-8 text-center text-sm text-destructive">
            {error || "Order not found."}
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="m-0 text-xs font-semibold text-sidebar-middle">
                    Order ID
                  </p>
                  <p className="m-0 mt-1 text-sm font-normal text-sidebar-top">
                    {`O${String(order.lotId).padStart(4, "0")}`}
                  </p>
                </div>
                <div>
                  <p className="m-0 text-xs font-semibold text-sidebar-middle">
                    Branch
                  </p>
                  <p className="m-0 mt-1 text-sm font-normal text-sidebar-top">
                    {branchName}
                  </p>
                </div>
                <div>
                  <p className="m-0 text-xs font-semibold text-sidebar-middle">
                    Order Date &amp; Time
                  </p>
                  <p className="m-0 mt-1 text-sm font-normal text-sidebar-top">
                    {formatOrderDateTime(order.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="m-0 text-xs font-semibold text-sidebar-middle">
                    Cashier
                  </p>
                  <p className="m-0 mt-1 text-sm font-normal text-sidebar-top">
                    {cashierDisplayName}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_280px]">
              <div className="overflow-hidden rounded-lg border border-border/60 bg-white p-4">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="border-b border-border/60">
                    <tr>
                      <th className="pb-3 font-bold text-sidebar-top">
                        Product
                      </th>
                      <th className="pb-3 font-bold text-sidebar-top">
                        Unit Price
                      </th>
                      <th className="pb-3 font-bold text-sidebar-top">
                        Quantity
                      </th>
                      <th className="pb-3 font-bold text-sidebar-top">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {order.items.map((item) => {
                      const productName =
                        productNameMap.get(item.pId) ?? `Product #${item.pId}`;
                      const subtotal = item.price * item.quantity;

                      return (
                        <tr key={item.codId}>
                          <td className="py-4 text-sidebar-top font-normal">
                            {productName}
                          </td>
                          <td className="py-4 text-sidebar-top font-normal">
                            {item.price.toFixed(2)} ฿
                          </td>
                          <td className="py-4 text-sidebar-top font-normal">
                            {item.quantity}
                          </td>
                          <td className="py-4 text-sidebar-top font-normal">
                            {subtotal.toFixed(2)} ฿
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="rounded-lg border border-border/60 bg-white p-5">
                <h3 className="m-0 text-base font-bold text-sidebar-top">
                  Payment Summary
                </h3>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sidebar-top font-normal">
                      Total Quantity
                    </span>
                    <span className="text-sidebar-top font-bold">
                      {totalQuantity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sidebar-top font-normal">
                      Total Amount
                    </span>
                    <span className="text-sidebar-top font-bold">
                      {totalAmount.toFixed(2)} ฿
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="button"
              className="mt-6 h-9 rounded-md bg-primary px-6 text-sm font-medium text-white hover:bg-primary/90"
              onClick={() => navigate("/cashier/order-lists")}
            >
              Back
            </Button>
          </>
        )}
      </section>
    </main>
  );
}
