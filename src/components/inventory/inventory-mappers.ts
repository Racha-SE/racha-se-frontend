import type { HqInventoryGroup, HqInventoryItem } from "@/api/inventory";

import type {
  InventoryItem,
  InventoryProduct,
  InventoryProductGroup,
} from "./inventory-types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "UTC" }).format(
    new Date(value),
  );
}

function toProduct(item: HqInventoryItem | HqInventoryGroup): InventoryProduct {
  return {
    productId: String(item.pId),
    category:
      item.categories.map((category) => category.categoryName).join(", ") ||
      "—",
    productName: item.productName,
    description: item.description,
    barcode: item.barcode,
  };
}

export function toInventoryItem(
  item: HqInventoryItem,
  index: number,
): InventoryItem {
  return {
    ...toProduct(item),
    lotId: `${item.pId}-${item.expiredDate}-${index}`,
    quantity: item.quantity,
    costPrice: item.costPrice,
    expiryDate: formatDate(item.expiredDate),
  };
}

export function toInventoryGroup(
  item: HqInventoryGroup,
): InventoryProductGroup {
  return {
    ...toProduct(item),
    items: item.stocks.map((stock, index) => ({
      lotId: `${item.pId}-${stock.expiredDate}-${index}`,
      quantity: stock.quantity,
      costPrice: stock.costPrice,
      expiryDate: formatDate(stock.expiredDate),
    })),
  };
}
