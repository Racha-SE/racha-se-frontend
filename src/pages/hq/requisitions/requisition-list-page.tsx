import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ClipboardList } from "lucide-react";

import { getBranches, type Branch } from "@/api/branch";
import { getHqRequisitions, requisitionStatuses } from "@/api/hq-requisitions";

import { PaginationControls } from "@/components/pagination-controls";
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

import { RequisitionStatus } from "./requisition-status";
import { requisitionDate, requisitionError } from "./requisition-utils";

const PAGE_SIZE = 10;

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "completed", label: "Completed" },
];

type ListData = Awaited<ReturnType<typeof getHqRequisitions>>;

type Result = {
  key: string;
  data?: ListData;
  error?: string;
};

export function RequisitionListPage() {
  const [params, setParams] = useSearchParams();

  const [result, setResult] = useState<Result | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchError, setBranchError] = useState(false);

  const rawStatus = params.get("status");
  const status = requisitionStatuses.find((value) => value === rawStatus);

  const parsedBranch = Number(params.get("branchId"));
  const branchId =
    Number.isSafeInteger(parsedBranch) && parsedBranch > 0
      ? parsedBranch
      : undefined;

  const parsedPage = Number(params.get("page") ?? "1");
  const page =
    Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const key = `${status ?? "all"}:${branchId ?? "all"}:${page}`;

  const loading = result?.key !== key;
  const data = loading ? undefined : result?.data;
  const error = loading ? undefined : result?.error;

  useEffect(() => {
    let active = true;

    getBranches()
      .then((response) => {
        if (active) {
          setBranches(response.data.result);
        }
      })
      .catch(() => {
        if (active) {
          setBranchError(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    getHqRequisitions({
      status,
      branchId,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    })
      .then((nextData) => {
        if (!active) return;

        const lastPage = Math.max(1, Math.ceil(nextData.totals / PAGE_SIZE));

        if (page > lastPage) {
          setParams(
            (current) => {
              const next = new URLSearchParams(current);
              next.set("page", String(lastPage));
              return next;
            },
            { replace: true },
          );

          return;
        }

        setResult({
          key,
          data: nextData,
        });
      })
      .catch((failure: unknown) => {
        if (active) {
          setResult({
            key,
            error: requisitionError(failure),
          });
        }
      });

    return () => {
      active = false;
    };
  }, [status, branchId, page, key, setParams]);

  function filter(name: string, value: string | null) {
    const next = new URLSearchParams(params);
    next.delete("page");

    if (!value || value === "all") {
      next.delete(name);
    } else {
      next.set(name, value);
    }

    setParams(next);
  }

  const branchOptions = [
    {
      value: "all",
      label: "All branches",
    },
    ...branches.map((branch) => ({
      value: String(branch.branchId),
      label: `${branch.name} (#${branch.branchId})`,
    })),
  ];

  if (branchId && !branches.some((branch) => branch.branchId === branchId)) {
    branchOptions.push({
      value: String(branchId),
      label: `Branch #${branchId}`,
    });
  }

  const totalPages = Math.max(1, Math.ceil((data?.totals ?? 0) / PAGE_SIZE));

  return (
    <main className="min-h-screen bg-background p-6 text-foreground">
      <header className="flex items-center gap-3 rounded-md bg-textbox p-3">
        <ClipboardList className="size-5 text-sidebar-top" aria-hidden="true" />

        <h1 className="text-xl font-semibold text-active">Requisitions</h1>
      </header>

      <section className="mt-6 space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <label
              id="requisition-branch-label"
              className="text-sm font-medium"
            >
              Branch
            </label>

            <Select
              items={branchOptions}
              value={String(branchId ?? "all")}
              onValueChange={(value) => filter("branchId", value)}
            >
              <SelectTrigger
                className="w-60"
                aria-labelledby="requisition-branch-label"
              >
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {branchOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label
              id="requisition-status-label"
              className="text-sm font-medium"
            >
              Status
            </label>

            <Select
              items={statusOptions}
              value={status ?? "all"}
              onValueChange={(value) => filter("status", value)}
            >
              <SelectTrigger
                className="w-44"
                aria-labelledby="requisition-status-label"
              >
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {branchError && (
          <p role="status" className="text-sm text-muted-foreground">
            Branch names could not be loaded. Requests still display their
            branch IDs.
          </p>
        )}

        {!status && (
          <p className="text-sm text-muted-foreground">
            Pending requests first, then newest requests.
          </p>
        )}

        {loading ? (
          <p role="status">Loading requisitions...</p>
        ) : error ? (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {data?.totals ?? 0} requests
            </p>

            <div className="rounded-lg border bg-surface">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {data?.orders.map((order) => (
                    <TableRow key={order.lotId}>
                      <TableCell>#{order.lotId}</TableCell>

                      <TableCell>
                        {branches.find(
                          (branch) => branch.branchId === order.branchId,
                        )?.name ??
                          `Branch #${
                            order.branchId ?? order.items[0]?.branchId ?? "—"
                          }`}
                      </TableCell>

                      <TableCell>{requisitionDate(order.createdAt)}</TableCell>

                      <TableCell>{order.items.length}</TableCell>

                      <TableCell>
                        {order.items.reduce(
                          (sum, item) => sum + item.amount,
                          0,
                        )}
                      </TableCell>

                      <TableCell>
                        <RequisitionStatus status={order.status} />
                      </TableCell>

                      <TableCell>
                        <Link
                          className="font-medium text-primary underline"
                          to={`/hq/requisitions/${order.lotId}?${params.toString()}`}
                        >
                          Review
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}

                  {!data?.orders.length && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center">
                        No requisitions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm">
                Page {page} of {totalPages}
              </p>

              <PaginationControls
                page={page}
                totalPages={totalPages}
                onPageChange={(nextPage) => {
                  const next = new URLSearchParams(params);

                  next.set("page", String(nextPage));
                  setParams(next);
                }}
              />
            </div>
          </>
        )}
      </section>
    </main>
  );
}
