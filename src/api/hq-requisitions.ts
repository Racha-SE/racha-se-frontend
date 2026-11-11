import { getBranchById } from "@/api/branch";
import { getProductById } from "@/api/product";
import {
  approveBranchOrder,
  getBranchOrderByLotId,
  getBranchOrders,
  rejectBranchOrder,
  type GetBranchOrdersQuery,
} from "@/api/orders-branch";
import type { OrderStatus } from "@/api/orders";

export const REQUISITIONS_CHANGED_EVENT = "hq-requisitions-changed";

export const requisitionStatuses: OrderStatus[] = [
  "pending",
  "approved",
  "rejected",
  "completed",
];

export async function getHqRequisitions(query: GetBranchOrdersQuery = {}) {
  if (query.status) {
    return (await getBranchOrders(query)).data;
  }

  const limit = query.limit ?? 10;
  const offset = query.offset ?? 0;

  const responses = await Promise.all(
    requisitionStatuses.map((status) =>
      getBranchOrders({
        branchId: query.branchId,
        status,
        limit: offset + limit,
        offset: 0,
      }),
    ),
  );

  const orders = responses.flatMap((response) => response.data.orders);

  orders.sort((a, b) => {
    const priority =
      Number(b.status === "pending") - Number(a.status === "pending");

    return (
      priority || b.createdAt.localeCompare(a.createdAt) || b.lotId - a.lotId
    );
  });

  return {
    orders: orders.slice(offset, offset + limit),
    totals: responses.reduce(
      (total, response) => total + response.data.totals,
      0,
    ),
    limit,
    offset,
  };
}

export async function getHqRequisition(lotId: number) {
  const { data: order } = await getBranchOrderByLotId(lotId);

  const branchId = order.branchId ?? order.items[0]?.branchId;
  const productIds = [...new Set(order.items.map((item) => item.pId))];

  const [branchResult, products] = await Promise.all([
    branchId === undefined
      ? Promise.resolve(null)
      : getBranchById(branchId).catch(() => null),
    Promise.allSettled(productIds.map((id) => getProductById(id))),
  ]);

  const productNames: Record<number, string> = {};

  products.forEach((result) => {
    if (result.status === "fulfilled") {
      productNames[result.value.data.pId] = result.value.data.name;
    }
  });

  return {
    order,
    branchId,
    branchName: branchResult?.data.result.name,
    productNames,
  };
}

export type HqRequisitionDetail = Awaited<ReturnType<typeof getHqRequisition>>;

export async function approveHqRequisition(lotId: number) {
  const response = await approveBranchOrder(lotId);

  window.dispatchEvent(new Event(REQUISITIONS_CHANGED_EVENT));

  return response.data;
}

export async function rejectHqRequisition(lotId: number, reason: string) {
  const response = await rejectBranchOrder(lotId, reason);

  window.dispatchEvent(new Event(REQUISITIONS_CHANGED_EVENT));

  return response.data;
}
