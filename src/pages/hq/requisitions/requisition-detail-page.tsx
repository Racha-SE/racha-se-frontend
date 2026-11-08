import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

import {
  approveHqRequisition,
  getHqRequisition,
  rejectHqRequisition,
  type HqRequisitionDetail,
} from "@/api/hq-requisitions";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { RequisitionDecisionDialog } from "./requisition-decision-dialog";
import { RequisitionStatus } from "./requisition-status";
import { requisitionDate, requisitionError } from "./requisition-utils";

export function RequisitionDetailPage() {
  const { lotId } = useParams();
  const id = Number(lotId);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return (
      <p role="alert" className="p-6">
        Invalid requisition ID.
      </p>
    );
  }

  return <RequisitionDetail key={id} lotId={id} />;
}

function RequisitionDetail({ lotId }: { lotId: number }) {
  const location = useLocation();

  const [detail, setDetail] = useState<HqRequisitionDetail | null>(null);

  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  const [dialog, setDialog] = useState<"approve" | "reject" | null>(null);

  const [revision, setRevision] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let active = true;

    getHqRequisition(lotId)
      .then((data) => {
        if (active) {
          setDetail(data);
          setLoadError("");
          setRefreshing(false);
        }
      })
      .catch((failure: unknown) => {
        if (active) {
          setLoadError(requisitionError(failure));
          setRefreshing(false);
        }
      });

    return () => {
      active = false;
    };
  }, [lotId, revision]);

  function refresh() {
    setRefreshing(true);
    setRevision((value) => value + 1);
  }

  async function decide(reason: string) {
    if (!dialog || !detail || detail.order.status !== "pending") {
      return;
    }

    setActionError("");

    try {
      const updated =
        dialog === "approve"
          ? await approveHqRequisition(lotId)
          : await rejectHqRequisition(lotId, reason);

      setDetail({
        ...detail,
        order: {
          ...updated,
          items: updated.items.map((item) => ({
            ...item,
            availableAmount: 0,
          })),
        },
      });

      setDialog(null);
      setNotice(`Requisition #${lotId} ${updated.status} successfully.`);
    } catch (failure) {
      setActionError(requisitionError(failure));
      refresh();
      throw failure;
    }
  }

  const order = detail?.order;
  const pending = order?.status === "pending";

  const quantities = new Map<number, number>();

  order?.items.forEach((item) => {
    quantities.set(item.pId, (quantities.get(item.pId) ?? 0) + item.amount);
  });

  const insufficient =
    order?.items.some(
      (item) => (quantities.get(item.pId) ?? 0) > item.availableAmount,
    ) ?? false;

  return (
    <main className="min-h-screen space-y-6 bg-background p-6 text-foreground">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={`/hq/requisitions${location.search}`}
          className="text-primary underline"
        >
          Back to requisitions
        </Link>
      </div>

      {notice && (
        <p
          role="status"
          className="rounded-md bg-emerald-50 p-3 text-emerald-900"
        >
          {notice}
        </p>
      )}

      {actionError && (
        <p role="alert" className="text-destructive">
          {actionError}
        </p>
      )}

      {loadError && (
        <p role="alert" className="text-destructive">
          {loadError}
        </p>
      )}

      {!order ? (
        !loadError && <p role="status">Loading requisition...</p>
      ) : (
        <>
          <header className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">
              Requisition #{order.lotId}
            </h1>

            <RequisitionStatus status={order.status} />
          </header>

          <dl className="grid gap-4 rounded-lg border bg-surface p-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Branch</dt>

              <dd>
                {detail.branchName ?? `Branch #${detail.branchId ?? "—"}`}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">
                Requested by (user ID)
              </dt>

              <dd className="break-all">{order.userId}</dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">Created</dt>

              <dd>{requisitionDate(order.createdAt)}</dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">Updated</dt>

              <dd>{requisitionDate(order.updatedAt)}</dd>
            </div>

            {order.approvedAt && (
              <div>
                <dt className="text-sm text-muted-foreground">Approved</dt>

                <dd>{requisitionDate(order.approvedAt)}</dd>
              </div>
            )}

            {order.approvedBy && (
              <div>
                <dt className="text-sm text-muted-foreground">
                  Approved by (user ID)
                </dt>

                <dd className="break-all">{order.approvedBy}</dd>
              </div>
            )}

            {order.receivedAt && (
              <div>
                <dt className="text-sm text-muted-foreground">Received</dt>

                <dd>{requisitionDate(order.receivedAt)}</dd>
              </div>
            )}
          </dl>

          {order.status === "rejected" && (
            <section className="rounded-lg border border-destructive/30 p-4">
              <h2 className="font-semibold">Rejection reason</h2>

              <p className="mt-2 whitespace-pre-wrap break-words">
                {order.rejectReason ||
                  "No reason was recorded for this request."}
              </p>
            </section>
          )}

          <div className="rounded-lg border bg-surface">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Requested quantity</TableHead>

                  {pending && <TableHead>Available HQ stock</TableHead>}
                </TableRow>
              </TableHeader>

              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.bodId}>
                    <TableCell>
                      {detail.productNames[item.pId] ?? `Product #${item.pId}`}

                      <span className="ml-2 text-muted-foreground">
                        #{item.pId}
                      </span>
                    </TableCell>

                    <TableCell>{item.amount}</TableCell>

                    {pending && (
                      <TableCell
                        className={
                          (quantities.get(item.pId) ?? 0) > item.availableAmount
                            ? "font-semibold text-destructive"
                            : ""
                        }
                      >
                        {item.availableAmount}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {pending && (
            <section className="space-y-3">
              {insufficient && (
                <p role="status" className="text-destructive">
                  HQ stock is insufficient for this request.
                </p>
              )}

              {!order.items.length && (
                <p role="alert" className="text-destructive">
                  This request has no line items.
                </p>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  disabled={
                    insufficient ||
                    !order.items.length ||
                    refreshing ||
                    Boolean(loadError)
                  }
                  onClick={() => setDialog("approve")}
                >
                  Approve
                </Button>

                <Button
                  type="button"
                  className="bg-destructive-active text-primary-foreground hover:bg-destructive"
                  disabled={refreshing || Boolean(loadError)}
                  onClick={() => setDialog("reject")}
                >
                  Reject
                </Button>
              </div>
            </section>
          )}

          {dialog && pending && (
            <RequisitionDecisionDialog
              key={dialog}
              action={dialog}
              lotId={lotId}
              onClose={() => setDialog(null)}
              onConfirm={decide}
            />
          )}
        </>
      )}
    </main>
  );
}
