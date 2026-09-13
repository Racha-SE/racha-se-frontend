import { UserRoundPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { mockProductCategories } from "./mock-products";
import { ProductForm } from "./product-form";
import type { ProductFormValues } from "./product-form-schema";

export function AddProductPage() {
  const navigate = useNavigate();

  function handleSubmit(values: ProductFormValues) {
    console.log("Product form values:", values);
  }

  function handleCancel() {
    navigate("/hq/products");
  }

  return (
    <main className="min-h-screen bg-background p-4">
      <header className="flex h-12 items-center gap-2.5 rounded-md bg-textbox px-4">
        <UserRoundPlus className="size-5 text-foreground" aria-hidden="true" />
        <h1 className="m-0 text-lg font-semibold tracking-normal text-active">
          Add Product
        </h1>
      </header>

      <section className="mt-6 px-3">
        <ProductForm
          categories={[...mockProductCategories]}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </section>
    </main>
  );
}
