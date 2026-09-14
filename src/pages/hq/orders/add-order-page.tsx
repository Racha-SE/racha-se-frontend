import { PackagePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { mockProductCategories } from "@/pages/hq/products/mock-products";

import { mockSupplierOptions } from "./mock-orders";
import { OrderForm } from "./order-form";
import type { OrderFormValues } from "./order-form-schema";

export function AddOrderPage() {
  const navigate = useNavigate();

  function handleSubmit(values: OrderFormValues) {
    console.log("Order form values:", values);
  }

  function handleCancel() {
    navigate("/hq/orders");
  }

  return (
    <main className="min-h-screen bg-background p-4">
      <header className="flex h-12 items-center gap-2.5 rounded-md bg-textbox px-4">
        <PackagePlus className="size-5 text-foreground" aria-hidden="true" />
        <h1 className="m-0 text-lg font-semibold tracking-normal text-active">
          Add Order
        </h1>
      </header>

      <section className="mt-4 px-3">
        <OrderForm
          categories={mockProductCategories}
          suppliers={mockSupplierOptions}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </section>
    </main>
  );
}
