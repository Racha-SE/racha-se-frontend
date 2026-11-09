import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { getBranches } from "@/api/branch";
import {
  getBranchOrderByLotId,
  type GetBranchOrderByLotIdResponse,
} from "@/api/orders-branch";

import { formatOrderId } from "./branch-order-format";
import { BranchOrderInfo } from "./branch-order-info";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function BranchOrderPage() {
  const { lotId } = useParams();
  const [order, setOrder] = useState<GetBranchOrderByLotIdResponse | null>(
    null,
  );
  const [branchName, setBranchName] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    let ignore = false;
    getBranchOrderByLotId(Number(lotId))
      .then(async (response) => {
        const loaded = response.data;
        const branchId = loaded.branchId ?? loaded.items[0]?.branchId;
        const branches = await getBranches().then((res) => res.data.result);
        if (ignore) return;
        setOrder(loaded);
        setBranchName(
          branches.find((branch) => branch.branchId === branchId)?.name ??
            `Branch #${branchId}`,
        );
      })
      .catch((err) => {
        if (ignore) return;
        console.error("Failed to load branch order:", err);
        setError(true);
      });

    return () => {
      ignore = true;
    };
  }, [lotId]);

  const productCount = new Set(order?.items.map((item) => item.pId)).size;
  const itemCount =
    order?.items.reduce((sum, item) => sum + item.amount, 0) ?? 0;

  return (
    <main className="min-h-screen bg-background p-6 text-left text-foreground">
      <Link
        to="/branch/orders/details"
        className="inline-flex items-center gap-1 text-sm text-searchbar"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to orders
      </Link>

      {error && <p className="mt-4">Could not load this order.</p>}
      {!error && !order && <p className="mt-4">Loading...</p>}
      {order && (
        <section className="mt-4 max-w-[960px]">
          <h1 className="m-0 text-2xl font-semibold text-active">
            Order {formatOrderId(order.lotId)}
          </h1>
          <p className="mt-1 mb-2 text-base text-sidebar-bottom">
            {branchName} · {order.status}
          </p>
          <BranchOrderInfo
            order={order}
            grid
            // Stock only exists once the order is approved or received (completed).
            showStock={
              order.status === "approved" || order.status === "completed"
            }
          />
          <p className="mt-2 text-sm">
            Total: {plural(productCount, "product")},{" "}
            {plural(itemCount, "item")}
          </p>
        </section>
      )}
    </main>
  );
}
