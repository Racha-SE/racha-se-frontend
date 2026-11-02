import type { OrderStatus } from "@/api/orders";

export type BranchOrderItem = {
  branchId: number;
  createdAt: Date;
  updatedAt: Date;
  pId: number;
  price: number;
  amount: number;
  remain: number;
  expiredDate: Date | null;
  costPrice: number;
  bodId: number;
};

export type BranchOrderItemRequest = {
  pId: number;
  amount: number;
};

export type GetBranchOrdersQuery = {
  status?: OrderStatus;
  branchId?: number;
  limit?: number;
  offset?: number;
};

type BranchOrder = {
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  lotId: number;
  orderType: "branch";
  approvedBy: string | null;
  approvedAt: Date | null;
  receivedAt: Date | null;
  rejectReason: string | null;
  items: BranchOrderItem[];
};

export type BranchOrderGetByLotIdResponse = Omit<BranchOrder, "items"> & {
  items: (BranchOrderItem & { availableAmount: number })[];
};

export type BranchOrdersGetResponse = {
  orders: BranchOrder[];
  limit: number;
  offset: number;
  totals: number;
};

export type CreateBranchOrdersBody = {
  items: BranchOrderItemRequest[];
};

export type BranchOrdersCreateResponse = BranchOrder;

export type BranchOrdersApproveResponse = BranchOrder;

export type BranchOrdersRejectResponse = BranchOrder;

export type BranchOrdersReceiveResponse = {
  message: string;
};
