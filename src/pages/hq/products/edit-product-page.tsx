import { Pencil } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { mockProductCategories, mockProducts } from "./mock-products";
import { ProductForm } from "./product-form";
import type { ProductFormValues } from "./product-form-schema";

export function EditProductPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const product = mockProducts.find((item) => item.pId === productId);

  if (!product) {
    return (
      <main className="min-h-screen bg-background p-4 text-foreground">
        Product not found
      </main>
    );
  }

  function handleSubmit(values: ProductFormValues) {
    console.log("Updated product form values:", values);
  }

  function handleCancel() {
    navigate("/hq/products");
  }

  return (
    <main className="min-h-screen bg-background p-4">
      <header className="flex h-12 items-center gap-2.5 rounded-md bg-textbox px-4">
        <Pencil className="size-5 text-foreground" aria-hidden="true" />
        <h1 className="m-0 text-lg font-semibold tracking-normal text-active">
          Edit Product
        </h1>
      </header>

      <section className="mt-6 px-3">
        <ProductForm
          categories={[...mockProductCategories]}
          initialValues={{
            productName: product.name,
            sellingPrice: String(product.sellingPrice),
            category: product.categoryValue,
            status: product.status,
          }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </section>
    </main>
  );
}
