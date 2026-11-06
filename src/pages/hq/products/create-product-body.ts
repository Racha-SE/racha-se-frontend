import type { CreateProductBody } from "@/api/product";

import type { ProductFormValues } from "./product-form-schema";

function generateBarcode() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");

  return `${timestamp}${random}`;
}

export function toCreateProductBody(
  values: ProductFormValues,
): CreateProductBody {
  return {
    name: values.productName,
    description: values.description || null,
    barcode: generateBarcode(),
    price: values.sellingPrice,
    minStockHq: values.minStockHq,
    minStockBranch: values.minStockBranch,
    isActive: values.status === "active",
    categoryIds: [Number(values.category)],
  };
}
