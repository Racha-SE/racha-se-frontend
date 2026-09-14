import { useEffect, useState } from "react";
import { PackagePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getCategories } from "@/api/category";

import { mockSupplierOptions } from "./mock-suppliers";
import { OrderForm } from "./order-form";
import type { OrderFormValues } from "./order-form-schema";

export function AddOrderPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<
    Array<{ label: string; value: string }>
  >([]);

  useEffect(() => {
    async function loadCategories() {
      const response = await getCategories();
      setCategories(
        response.data.result.map((category) => ({
          label: category.categoryName,
          value: String(category.categoryId),
        })),
      );
    }

    void loadCategories();
  }, []);

  function handleSubmit(values: OrderFormValues) {
    console.log("Order form values:", values);
  }

  function handleCancel() {
    navigate("/hq/inventory");
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
          categories={categories}
          suppliers={mockSupplierOptions}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </section>
    </main>
  );
}
