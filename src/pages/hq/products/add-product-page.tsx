import { useEffect, useState } from "react";
import { PackagePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getCategories, type Category } from "@/api/category";
import { createProduct } from "@/api/product";

import { ProductForm } from "./product-form";
import type { ProductFormValues } from "./product-form-schema";

function generateBarcode() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");

  return `${timestamp}${random}`;
}

export function AddProductPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function loadCategories() {
      const response = await getCategories();
      setCategories(response.data.result);
    }

    void loadCategories();
  }, []);

  async function handleSubmit(values: ProductFormValues) {
    await createProduct({
      name: values.productName,
      description: values.description || null,
      barcode: generateBarcode(),
      costPrice: values.sellingPrice,
      minStockHq: values.minStockHq,
      minStockBranch: values.minStockBranch,
      isActive: values.status === "active",
      categoryIds: [Number(values.category)],
    });

    navigate("/hq/products");
  }

  function handleCategoryCreated(category: Category) {
    setCategories((currentCategories) => {
      if (
        currentCategories.some(
          (currentCategory) =>
            currentCategory.categoryId === category.categoryId,
        )
      ) {
        return currentCategories;
      }

      return [...currentCategories, category];
    });
  }

  function handleCancel() {
    navigate("/hq/products");
  }

  const categoryOptions = categories.map((category) => ({
    label: category.categoryName,
    value: String(category.categoryId),
  }));

  return (
    <main className="min-h-screen bg-background p-4">
      <header className="flex h-12 items-center gap-2.5 rounded-md bg-textbox px-4">
        <PackagePlus className="size-5 text-foreground" aria-hidden="true" />
        <h1 className="m-0 text-lg font-semibold tracking-normal text-active">
          Add Product
        </h1>
      </header>

      <section className="mt-6 px-3">
        <ProductForm
          categories={categoryOptions}
          onCategoryCreated={handleCategoryCreated}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </section>
    </main>
  );
}
