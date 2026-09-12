import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  productFormSchema,
  type ProductFormInput,
  type ProductFormValues,
} from "./product-form-schema";

interface ProductFormProps {
  categories: { label: string; value: string }[];
  initialValues?: Partial<ProductFormInput>;
  onSubmit: (values: ProductFormValues) => void | Promise<void>;
  onCancel: () => void;
}

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
] as const;

export function ProductForm({
  categories,
  initialValues = {},
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const form = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      productName: initialValues.productName ?? "",
      sellingPrice: initialValues.sellingPrice ?? "",
      category: initialValues.category ?? "",
      status: initialValues.status ?? "active",
    },
  });

  return (
    <form
      className="w-full max-w-md text-sm"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <Controller
          name="productName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-1" data-invalid={fieldState.invalid}>
              <FieldLabel
                htmlFor="product-name"
                className="text-sm font-normal text-active"
              >
                Product Name *
              </FieldLabel>
              <Input
                {...field}
                id="product-name"
                className="h-9 max-w-[280px] rounded-md bg-textbox px-3 py-2 text-sm"
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="sellingPrice"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-1" data-invalid={fieldState.invalid}>
              <FieldLabel
                htmlFor="selling-price"
                className="text-sm font-normal text-active"
              >
                Selling Price *
              </FieldLabel>
              <Input
                {...field}
                id="selling-price"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                className="h-9 max-w-[280px] rounded-md bg-textbox px-3 py-2 text-sm"
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="category"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-1" data-invalid={fieldState.invalid}>
              <FieldLabel
                htmlFor="product-category"
                className="text-sm font-normal text-active"
              >
                Category *
              </FieldLabel>
              <Select
                items={categories}
                value={field.value || null}
                onValueChange={(value) => field.onChange(value ?? "")}
              >
                <SelectTrigger
                  id="product-category"
                  className="h-9! w-[150px] rounded-md px-3 py-2 text-sm"
                  aria-invalid={fieldState.invalid}
                  onBlur={field.onBlur}
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent
                  align="start"
                  alignItemWithTrigger={false}
                  className="min-w-0 text-sm"
                >
                  {categories.map((category) => (
                    <SelectItem
                      key={category.value}
                      value={category.value}
                      className="py-2 pr-3 pl-8 text-sm"
                    >
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="status"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-1" data-invalid={fieldState.invalid}>
              <FieldLabel
                htmlFor="product-status"
                className="text-sm font-normal text-active"
              >
                Status *
              </FieldLabel>
              <Select
                items={statusOptions}
                value={field.value || null}
                onValueChange={(value) => field.onChange(value ?? "")}
              >
                <SelectTrigger
                  id="product-status"
                  className="h-9! w-[150px] rounded-md px-3 py-2 text-sm"
                  aria-invalid={fieldState.invalid}
                  onBlur={field.onBlur}
                >
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent
                  align="start"
                  alignItemWithTrigger={false}
                  className="min-w-0 text-sm"
                >
                  {statusOptions.map((status) => (
                    <SelectItem
                      key={status.value}
                      value={status.value}
                      className="py-2 pr-3 pl-8 text-sm"
                    >
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <div className="flex gap-3">
          <Button
            type="submit"
            className="h-auto rounded-[6px] px-4 py-2 text-sm"
            disabled={form.formState.isSubmitting}
          >
            Save
          </Button>
          <Button
            type="button"
            className="h-auto rounded-[6px] bg-destructive-active px-4 py-2 text-sm text-primary-foreground hover:bg-destructive"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
