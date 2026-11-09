import { useEffect, useState } from "react";
import { ClipboardList, Eye } from "lucide-react";

import { getBranches, type Branch } from "@/api/branch";
import type { OrderStatus } from "@/api/orders";
import { getBranchOrders, type BranchOrder } from "@/api/orders-branch";
import { PaginationControls } from "@/components/pagination-controls";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSession } from "@/lib/auth-client";

import { BranchOrderItemsDialog } from "./branch-order-items-dialog";
import { formatDateTime, formatOrderId } from "./branch-order-format";

const PAGE_SIZE = 10;
const ALL_BRANCHES = "all";
const ALL_STATUSES = "all";

const statusOptions: Array<{ label: string; value: string }> = [
  { label: "All statuses", value: ALL_STATUSES },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Completed", value: "completed" },
];

export function BranchOrderDetailsPage() {
  const { data: session } = useSession();
  const isBranchUser = session?.user.userType === "branch";
  // Branch users are pinned to their own branch; hq may pick any or "all".
  const ownBranchId = session?.user.branchId;

  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState(ALL_BRANCHES);
  const [status, setStatus] = useState(ALL_STATUSES);
  const [orders, setOrders] = useState<BranchOrder[]>([]);
  const [totals, setTotals] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [viewedOrder, setViewedOrder] = useState<BranchOrder | null>(null);

  const missingBranch = isBranchUser && ownBranchId == null;
  const branchId = isBranchUser
    ? ownBranchId
    : selectedBranch === ALL_BRANCHES
      ? undefined
      : Number(selectedBranch);

  useEffect(() => {
    getBranches()
      .then((response) => setBranches(response.data.result))
      .catch((error) => console.error("Failed to load branches:", error));
  }, []);

  useEffect(() => {
    if (missingBranch) return;

    let ignore = false;
    getBranchOrders({
      status: status === ALL_STATUSES ? undefined : (status as OrderStatus),
      branchId: branchId ?? undefined,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    })
      .then((response) => {
        if (ignore) return;
        setOrders(response.data.orders);
        setTotals(response.data.totals);
        setLoadError(false);
      })
      .catch((error) => {
        if (ignore) return;
        console.error("Failed to load branch orders:", error);
        setLoadError(true);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [branchId, status, page, missingBranch]);

  const branchName = (id: number | undefined) =>
    branches.find((branch) => branch.branchId === id)?.name ?? `Branch #${id}`;
  const orderBranchId = (order: BranchOrder) =>
    order.branchId ?? order.items[0]?.branchId;

  const branchOptions = [
    { label: "All branches", value: ALL_BRANCHES },
    ...branches.map((branch) => ({
      label: branch.name,
      value: String(branch.branchId),
    })),
  ];
  const totalPages = Math.max(Math.ceil(totals / PAGE_SIZE), 1);

  return (
    <main className="min-h-screen bg-background p-6 text-left text-foreground">
      <header className="flex h-12 items-center gap-3 rounded-md bg-textbox px-3">
        <ClipboardList
          className="size-4.5 text-sidebar-top"
          aria-hidden="true"
        />
        <h1 className="m-0 text-xl font-semibold tracking-normal text-active">
          Branch Orders
        </h1>
      </header>

      <section className="mt-4 space-y-4 px-2">
        <div className="flex flex-wrap items-center gap-3">
          {isBranchUser ? (
            <h2 className="m-0 text-xl font-semibold text-active">
              {branchName(ownBranchId ?? undefined)}
            </h2>
          ) : (
            <Select
              items={branchOptions}
              value={selectedBranch}
              onValueChange={(next) => {
                setSelectedBranch(next ?? ALL_BRANCHES);
                setPage(1);
                setLoading(true);
              }}
            >
              <SelectTrigger
                className="h-8! w-[240px] rounded-sm bg-surface px-3 text-sm"
                aria-label="Filter by branch"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start" alignItemWithTrigger={false}>
                {branchOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select
            items={statusOptions}
            value={status}
            onValueChange={(next) => {
              setStatus(next ?? ALL_STATUSES);
              setPage(1);
              setLoading(true);
            }}
          >
            <SelectTrigger
              className="h-8! w-[204px] rounded-sm bg-surface px-3 text-sm"
              aria-label="Filter by status"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {missingBranch ? (
          <div className="py-10 text-center text-destructive">
            Your account isn&apos;t assigned to a branch.
          </div>
        ) : loading ? (
          <div className="py-10 text-center">Loading...</div>
        ) : loadError ? (
          <div className="py-10 text-center text-destructive">
            Couldn&apos;t load orders. Please try again.
          </div>
        ) : (
          <div className="max-w-[960px] border border-border">
            <Table>
              <TableHeader>
                <TableRow className="font-bold hover:bg-transparent">
                  <TableHead className="border-r border-border">
                    Order ID
                  </TableHead>
                  <TableHead className="border-r border-border">
                    Branch
                  </TableHead>
                  <TableHead className="border-r border-border">
                    Status
                  </TableHead>
                  <TableHead className="border-r border-border">
                    Created
                  </TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow
                    key={order.lotId}
                    className="even:bg-textbox hover:bg-primary-subtle"
                  >
                    <TableCell className="border-r border-border">
                      {formatOrderId(order.lotId)}
                    </TableCell>
                    <TableCell className="border-r border-border">
                      {branchName(orderBranchId(order))}
                    </TableCell>
                    <TableCell className="border-r border-border capitalize">
                      {order.status}
                    </TableCell>
                    <TableCell className="border-r border-border">
                      {formatDateTime(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`View order ${formatOrderId(order.lotId)}`}
                        onClick={() => setViewedOrder(order)}
                      >
                        <Eye />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex max-w-[960px] items-center justify-between text-sm">
          <span>Showing {orders.length} orders</span>
          <PaginationControls
            page={page}
            totalPages={totalPages}
            jumpable
            onPageChange={(next) => {
              setPage(next);
              setLoading(true);
            }}
          />
        </div>
      </section>

      <BranchOrderItemsDialog
        order={viewedOrder}
        branchName={viewedOrder ? branchName(orderBranchId(viewedOrder)) : ""}
        onOpenChange={(open) => {
          if (!open) setViewedOrder(null);
        }}
      />
    </main>
  );
}
