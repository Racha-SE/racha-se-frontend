import { useEffect, useState } from "react";
import { FilePenLine } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { getCategories, type Category } from "@/api/category";
import { getProductById, updateProduct, type Product } from "@/api/product";

import { ProductForm } from "./product-form";
import type { ProductFormValues } from "./product-form-schema";

export function EditProductPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!productId) {
        setLoading(false);
        return;
      }

      const id = Number(productId);

      if (!Number.isInteger(id) || id < 1) {
        setLoading(false);
        return;
      }

      try {
        const [productResponse, categoriesResponse] = await Promise.all([
          getProductById(id),
          getCategories(),
        ]);

        setProduct(productResponse.data);
        setCategories(categoriesResponse.data.result);
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [productId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-4 text-foreground">
        Loading...
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-background p-4 text-foreground">
        Product not found
      </main>
    );
  }

  async function handleSubmit(values: ProductFormValues) {
    if (!product) return;

    await updateProduct(product.pId, {
      name: values.productName,
      description: values.description || null,
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
        <FilePenLine className="size-5 text-foreground" aria-hidden="true" />
        <h1 className="m-0 text-lg font-semibold tracking-normal text-active">
          Edit Product
        </h1>
      </header>

      <section className="mt-6 px-3">
        <ProductForm
          categories={categoryOptions}
          initialValues={{
            productName: product.name,
            description: product.description ?? "",
            sellingPrice: String(product.costPrice),
            category:
              product.categories.length > 0
                ? String(product.categories[0].categoryId)
                : "",
            minStockHq: String(product.minStockHq),
            minStockBranch: String(product.minStockBranch),
            status: product.isActive ? "active" : "inactive",
          }}
          onCategoryCreated={handleCategoryCreated}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </section>
    </main>
  );
}
