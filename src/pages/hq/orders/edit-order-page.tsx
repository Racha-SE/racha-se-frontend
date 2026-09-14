import { Pencil } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { mockProductCategories } from "@/pages/hq/products/mock-products";

import { mockOrders, mockSupplierOptions } from "./mock-orders";
import { OrderForm } from "./order-form";
import type { OrderFormInput, OrderFormValues } from "./order-form-schema";

export function EditOrderPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const order = mockOrders.find((item) => item.orderId === orderId);

  if (!order) {
    return (
      <main className="min-h-screen bg-background p-4 text-foreground">
        Order not found
      </main>
    );
  }

  const initialValues: OrderFormInput = {
    products: order.items.map((item) => ({
      productName: item.productName,
      category: item.productCategoryValue,
      supplier: item.supplierValue,
      quantity: String(item.quantity),
      costPrice: String(item.costPrice),
      expiryDate: toDateInputValue(item.expiryDate),
    })),
  };

  function handleSubmit(values: OrderFormValues) {
    console.log("Updated order form values:", values);
  }

  function handleCancel() {
    navigate("/hq/orders");
  }

  return (
    <main className="min-h-screen bg-background p-4">
      <header className="flex h-12 items-center gap-2.5 rounded-md bg-textbox px-4">
        <Pencil className="size-5 text-foreground" aria-hidden="true" />
        <h1 className="m-0 text-lg font-semibold tracking-normal text-active">
          Edit Order
        </h1>
      </header>

      <section className="mt-4 px-3">
        <OrderForm
          categories={mockProductCategories}
          suppliers={mockSupplierOptions}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </section>
    </main>
  );
}

function toDateInputValue(date: string) {
  const [day, month, year] = date.split("/");
  return `${year}-${month}-${day}`;
}
