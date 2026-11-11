import { useEffect, useState } from "react";

import { getCategories, type Category } from "@/api/category";
import { ApiError } from "@/api/client";
import { createProduct, type Product } from "@/api/product";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { toCreateProductBody } from "../products/create-product-body";
import { ProductForm } from "../products/product-form";
import type { ProductFormValues } from "../products/product-form-schema";

interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialName?: string;
  onCreated: (product: Product) => void;
}

export function CreateProductDialog({
  open,
  onOpenChange,
  initialName = "",
  onCreated,
}: CreateProductDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadCategories() {
      try {
        const response = await getCategories();
        if (!cancelled) setCategories(response.data.result);
      } catch {
        if (!cancelled) setError("Couldn't load categories.");
      }
    }

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, [open]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) setError(null);
    onOpenChange(nextOpen);
  }

  async function handleSubmit(values: ProductFormValues) {
    setError(null);

    try {
      const response = await createProduct(toCreateProductBody(values));
      onCreated(response.data);
      handleOpenChange(false);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't create product.",
      );
    }
  }

  function handleCategoryCreated(category: Category) {
    setCategories((currentCategories) =>
      currentCategories.some(
        (currentCategory) => currentCategory.categoryId === category.categoryId,
      )
        ? currentCategories
        : [...currentCategories, category],
    );
  }

  const categoryOptions = categories.map((category) => ({
    label: category.categoryName,
    value: String(category.categoryId),
  }));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        overlayClassName="bg-black/30"
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg"
        onSubmit={(event) => event.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle className="text-active">Create New Product</DialogTitle>
          <DialogDescription>
            The new product will be selected for this order line.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <ProductForm
          categories={categoryOptions}
          initialValues={{ productName: initialName.trim() }}
          showStatus={false}
          onCategoryCreated={handleCategoryCreated}
          onSubmit={handleSubmit}
          onCancel={() => handleOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
