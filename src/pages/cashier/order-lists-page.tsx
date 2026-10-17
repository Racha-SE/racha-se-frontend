import { useEffect, useState } from "react";
import { Eye, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getBranches, type Branch } from "@/api/branch";
import { getCustomerOrders, type CustomerOrder } from "@/api/orders";
import { PaginationControls } from "@/components/pagination-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/lib/auth-client";

const itemsPerPage = 10;

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

export function OrderListsPage() {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadBranches() {
      try {
        const response = await getBranches();
        setBranches(response.data.result);
      } catch {
        // Fallback silently if branches can't be fetched
      }
    }
    void loadBranches();
  }, []);

  useEffect(() => {
    async function loadOrders() {
      setIsLoading(true);
      try {
        const response = await getCustomerOrders({
          limit: itemsPerPage,
          offset: (page - 1) * itemsPerPage,
        });
        setOrders(response.data.orders);
        setTotalCount(response.data.totals);
      } catch (err) {
        console.error("Failed to load customer orders", err);
      } finally {
        setIsLoading(false);
      }
    }

    void loadOrders();
  }, [page]);

  const branchNameMap = new Map<number, string>(
    branches.map((b) => [b.branchId, b.name]),
  );

  const fallbackBranchName =
    (session?.user.branchId != null
      ? branchNameMap.get(session.user.branchId)
      : undefined) ??
    branches.find((b) => b.branchId === session?.user.branchId)?.name ??
    (session?.user.branchId ? `Branch #${session.user.branchId}` : "Branch");

  const cashierDisplayName =
    session?.user.firstname ||
    session?.user.name ||
    session?.user.username ||
    "Raisenx";

  const filteredOrders = orders.filter((order) => {
    if (!search.trim()) return true;
    const term = search.trim().toLowerCase();
    const orderIdFormatted =
      `o${String(order.lotId).padStart(4, "0")}`.toLowerCase();
    const targetBranchId =
      order.branchId ?? order.items[0]?.branchId ?? session?.user.branchId;
    const branchName = (
      (targetBranchId != null
        ? branchNameMap.get(targetBranchId)
        : undefined) ?? fallbackBranchName
    ).toLowerCase();

    return (
      orderIdFormatted.includes(term) ||
      String(order.lotId).includes(term) ||
      branchName.includes(term) ||
      cashierDisplayName.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.max(Math.ceil(totalCount / itemsPerPage), 1);

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

      <section className="mt-4 space-y-4">
        <h2 className="m-0 text-2xl font-bold tracking-tight text-active">
          Order List
        </h2>

        <div>
          <Input
            className="h-8 max-w-[320px] rounded-sm border-border bg-searchbar px-3 text-primary-foreground placeholder:text-primary-foreground/70 focus-visible:border-focus focus-visible:ring-focus/20"
            value={search}
            placeholder="Search Order"
            aria-label="Search orders"
            onChange={(event) => {
              setSearch(event.target.value);
            }}
          />
        </div>

        <div className="overflow-hidden rounded-lg border border-border/60 bg-white">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-border/60 bg-[#f0f5fd]">
              <tr>
                <th className="px-4 py-3 font-bold text-sidebar-top">
                  Order ID
                </th>
                <th className="px-4 py-3 font-bold text-sidebar-top">Branch</th>
                <th className="px-4 py-3 font-bold text-sidebar-top">
                  Order Date &amp; Time
                </th>
                <th className="px-4 py-3 font-bold text-sidebar-top">
                  Cashier
                </th>
                <th className="px-4 py-3 font-bold text-sidebar-top">
                  Quantity
                </th>
                <th className="px-4 py-3 font-bold text-sidebar-top">Total</th>
                <th className="px-4 py-3 text-center font-bold text-sidebar-top">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-white">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const targetBranchId =
                    order.branchId ??
                    order.items[0]?.branchId ??
                    session?.user.branchId;
                  const branchName =
                    (targetBranchId != null
                      ? branchNameMap.get(targetBranchId)
                      : undefined) ?? fallbackBranchName;
                  const totalQuantity = order.items.reduce(
                    (sum, item) => sum + item.quantity,
                    0,
                  );
                  const totalPrice = order.items.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0,
                  );
                  const formattedOrderId = `O${String(order.lotId).padStart(4, "0")}`;

                  return (
                    <tr
                      key={order.lotId}
                      className="transition-colors hover:bg-muted/40"
                    >
                      <td className="px-4 py-3 font-normal text-sidebar-top">
                        {formattedOrderId}
                      </td>
                      <td className="px-4 py-3 font-normal text-sidebar-top">
                        {branchName}
                      </td>
                      <td className="px-4 py-3 font-normal text-sidebar-top">
                        {formatOrderDateTime(order.createdAt)}
                      </td>
                      <td className="px-4 py-3 font-normal text-sidebar-top">
                        {cashierDisplayName}
                      </td>
                      <td className="px-4 py-3 font-normal text-sidebar-top">
                        {totalQuantity}
                      </td>
                      <td className="px-4 py-3 font-normal text-sidebar-top">
                        {totalPrice.toFixed(2)} ฿
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="h-8 w-8 hover:bg-muted"
                          aria-label={`View order ${formattedOrderId}`}
                          onClick={() =>
                            navigate(`/cashier/order-details/${order.lotId}`)
                          }
                        >
                          <Eye
                            className="size-4.5 text-sidebar-top"
                            aria-hidden="true"
                          />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-sm text-foreground">
          <span>Showing {filteredOrders.length} Orders</span>
          <PaginationControls
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </section>
    </main>
  );
}
