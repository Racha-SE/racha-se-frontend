import { useEffect, useState } from "react";
import { PackageCheck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { ApiError } from "@/api/client";
import {
  getBranchOrderByLotId,
  getReceiveBranchOrderErrorMessage,
  receiveBranchOrder,
  type GetBranchOrderByLotIdResponse,
} from "@/api/orders-branch";
import { getProductById } from "@/api/product";
import { Button } from "@/components/ui/button";

import { ReceiveStockForm, type ReceiveStockLine } from "./receive-stock-form";
import type {
  ReceiveStockFormInput,
  ReceiveStockFormValues,
} from "./receive-stock-form-schema";
import { RequisitionStatusBadge } from "./requisition-status-badge";

type BranchOrder = GetBranchOrderByLotIdResponse;

// Only an HQ-approved requisition can be received; anything else gets a
// reason instead of the form.
function getNotReceivableMessage(order: BranchOrder) {
  switch (order.status) {
    case "pending":
      return "This requisition is still waiting for HQ approval.";
    case "rejected":
      return "This requisition was rejected by HQ and can't be received.";
    case "completed":
      return "This requisition has already been received.";
    default:
      return null;
  }
}

// The date input wants YYYY-MM-DD; the backend sends a full ISO timestamp.
function toDateInputValue(isoDate: string | null) {
  return isoDate ? isoDate.slice(0, 10) : "";
}

const receivedAtFormat = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function ReceiveStockPage() {
  const navigate = useNavigate();
  const { lotId: lotIdParam } = useParams<{ lotId: string }>();
  const lotId = Number(lotIdParam);
  const isValidLotId = Number.isInteger(lotId) && lotId > 0;

  const [order, setOrder] = useState<BranchOrder | null>(null);
  const [productNames, setProductNames] = useState<Map<number, string>>(
    new Map(),
  );
  const [isLoading, setIsLoading] = useState(isValidLotId);
  const [loadError, setLoadError] = useState<string | null>(
    isValidLotId ? null : "Requisition not found.",
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isReceived, setIsReceived] = useState(false);

  useEffect(() => {
    if (!isValidLotId) return;

    let cancelled = false;

    async function loadOrder() {
      try {
        const response = await getBranchOrderByLotId(lotId);
        if (cancelled) return;

        const loadedOrder = response.data;
        setOrder(loadedOrder);

        // Order lines only carry pId, so look up names separately. A failed
        // lookup falls back to "Product #id" instead of blocking the form.
        const pIds = [...new Set(loadedOrder.items.map((item) => item.pId))];
        const results = await Promise.allSettled(
          pIds.map((pId) => getProductById(pId)),
        );
        if (cancelled) return;

        const names = new Map<number, string>();
        results.forEach((result) => {
          if (result.status === "fulfilled") {
            names.set(result.value.data.pId, result.value.data.name);
          }
        });
        setProductNames(names);
      } catch (error) {
        if (cancelled) return;
        setLoadError(
          error instanceof ApiError && error.status === 404
            ? "Requisition not found."
            : "Couldn't load the requisition. Please try again.",
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadOrder();

    return () => {
      cancelled = true;
    };
  }, [isValidLotId, lotId]);

  // The form has already validated every line by the time this runs. Each
  // line's counted quantity and expiry are sent, so branch stock records what
  // actually arrived rather than what HQ approved.
  async function handleSubmit(values: ReceiveStockFormValues) {
    setSubmitError(null);

    try {
      await receiveBranchOrder(lotId, {
        items: values.items.map((item) => ({
          bodId: item.bodId,
          receivedQty: item.receivedQty,
          // Same end-of-day UTC convention as HQ orders, so the date reads
          // back unchanged.
          expiredDate: `${item.expiryDate}T23:59:59.999Z`,
        })),
      });
    } catch (error) {
      setSubmitError(getReceiveBranchOrderErrorMessage(error));
      return;
    }

    setIsReceived(true);

    // Receive only answers with a message, so read the requisition back to
    // show the status and receive time the backend recorded. The receive
    // itself already succeeded, so if this read fails, mark it received
    // locally rather than showing an error.
    try {
      const response = await getBranchOrderByLotId(lotId);
      setOrder(response.data);
    } catch {
      setOrder((current) =>
        current
          ? {
              ...current,
              status: "completed",
              receivedAt: new Date().toISOString(),
            }
          : current,
      );
    }
  }

  function handleCancel() {
    navigate(-1);
  }

  // Once this page has received the stock, the order comes back "completed";
  // keep showing the confirmed form instead of the "already received" notice.
  const notReceivableMessage =
    order && !isReceived ? getNotReceivableMessage(order) : null;

  const lines: ReceiveStockLine[] =
    order?.items.map((item) => ({
      bodId: item.bodId,
      productName: productNames.get(item.pId) ?? `Product #${item.pId}`,
      approvedQty: item.amount,
    })) ?? [];

  const defaultValues: ReceiveStockFormInput = {
    items:
      order?.items.map((item) => ({
        bodId: item.bodId,
        approvedQty: item.amount,
        receivedQty: String(item.amount),
        expiryDate: toDateInputValue(item.expiredDate),
      })) ?? [],
  };

  return (
    <main className="min-h-screen bg-background p-4 text-left">
      <header className="flex h-12 items-center gap-2.5 rounded-md bg-textbox px-4">
        <PackageCheck className="size-5 text-foreground" aria-hidden="true" />
        <h1 className="m-0 text-xl font-semibold tracking-normal text-active">
          Receive Stock
        </h1>
      </header>

      <section className="mt-4 space-y-4 px-3">
        {isValidLotId && (
          <div className="flex flex-wrap items-center gap-3 text-sm text-sidebar-middle">
            <p className="m-0">
              Requisition{" "}
              <span className="font-semibold text-sidebar-top">#{lotId}</span>
            </p>
            {order && <RequisitionStatusBadge status={order.status} />}
            {order?.status === "completed" && order.receivedAt && (
              <p className="m-0">
                Received {receivedAtFormat.format(new Date(order.receivedAt))}
              </p>
            )}
          </div>
        )}

        {isLoading ? (
          <p className="py-6 text-sm text-muted-foreground">
            Loading requisition...
          </p>
        ) : loadError || !order ? (
          <p className="py-6 text-sm text-destructive" role="alert">
            {loadError ?? "Requisition not found."}
          </p>
        ) : notReceivableMessage ? (
          <div className="space-y-4">
            <p className="py-2 text-sm text-muted-foreground">
              {notReceivableMessage}
            </p>
            <Button
              type="button"
              variant="outline"
              className="h-auto rounded-[6px] px-4 py-2 text-sm"
              onClick={handleCancel}
            >
              Back
            </Button>
          </div>
        ) : (
          <>
            <p className="m-0 text-sm text-muted-foreground">
              Check each item against the delivery, then confirm receipt.
            </p>

            {isReceived && (
              <div
                className="flex flex-wrap items-center gap-3 rounded-md border border-success/40 bg-success/10 px-4 py-3 text-sm text-sidebar-top"
                role="status"
              >
                <span>
                  Stock received. Branch inventory now includes these items.
                </span>
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto rounded-[6px] px-3 py-1.5 text-sm"
                  onClick={() => navigate("/branch/inventory")}
                >
                  Go to branch inventory
                </Button>
              </div>
            )}

            {submitError && (
              <p className="text-sm text-destructive" role="alert">
                {submitError}
              </p>
            )}

            <ReceiveStockForm
              lines={lines}
              defaultValues={defaultValues}
              disabled={isReceived}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </>
        )}
      </section>
    </main>
  );
}
