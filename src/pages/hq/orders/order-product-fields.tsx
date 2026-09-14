import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { OrderFormInput, OrderFormValues } from "./order-form-schema";

interface OrderProductFieldsProps {
  index: number;
  control: Control<OrderFormInput, unknown, OrderFormValues>;
  categories: readonly { label: string; value: string }[];
  suppliers: readonly { label: string; value: string }[];
}

const inputClassName =
  "h-9 w-full max-w-[280px] rounded-md bg-textbox px-3 py-2 text-sm";
const selectTriggerClassName =
  "h-9! w-full max-w-[280px] rounded-md px-3 py-2 text-sm";

export function OrderProductFields({
  index,
  control,
  categories,
  suppliers,
}: OrderProductFieldsProps) {
  const fieldIdPrefix = `order-product-${index}`;

  return (
    <fieldset className="space-y-4 border-b border-border pb-6 last:border-b-0">
      <legend className="mb-4 text-sm font-medium text-active">
        Product {index + 1} *
      </legend>

      <div className="grid grid-cols-1 gap-x-14 gap-y-5 md:grid-cols-2">
        <div className="space-y-5">
          <Controller
            name={`products.${index}.productName`}
            control={control}
            render={({ field, fieldState }) => (
              <Field className="gap-1" data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor={`${fieldIdPrefix}-name`}
                  className="text-sm font-normal text-active"
                >
                  Product Name *
                </FieldLabel>
                <Input
                  {...field}
                  id={`${fieldIdPrefix}-name`}
                  className={inputClassName}
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            name={`products.${index}.category`}
            control={control}
            render={({ field, fieldState }) => (
              <Field className="gap-1" data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor={`${fieldIdPrefix}-category`}
                  className="text-sm font-normal text-active"
                >
                  Product Category *
                </FieldLabel>
                <Select
                  items={categories}
                  value={field.value || null}
                  onValueChange={(value) => field.onChange(value ?? "")}
                >
                  <SelectTrigger
                    id={`${fieldIdPrefix}-category`}
                    className={selectTriggerClassName}
                    aria-invalid={fieldState.invalid}
                    onBlur={field.onBlur}
                  >
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent align="start" alignItemWithTrigger={false}>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
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
            name={`products.${index}.supplier`}
            control={control}
            render={({ field, fieldState }) => (
              <Field className="gap-1" data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor={`${fieldIdPrefix}-supplier`}
                  className="text-sm font-normal text-active"
                >
                  Supplier *
                </FieldLabel>
                <Select
                  items={suppliers}
                  value={field.value || null}
                  onValueChange={(value) => field.onChange(value ?? "")}
                >
                  <SelectTrigger
                    id={`${fieldIdPrefix}-supplier`}
                    className={selectTriggerClassName}
                    aria-invalid={fieldState.invalid}
                    onBlur={field.onBlur}
                  >
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent align="start" alignItemWithTrigger={false}>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.value} value={supplier.value}>
                        {supplier.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>

        <div className="space-y-5">
          <Controller
            name={`products.${index}.quantity`}
            control={control}
            render={({ field, fieldState }) => (
              <Field className="gap-1" data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor={`${fieldIdPrefix}-quantity`}
                  className="text-sm font-normal text-active"
                >
                  Quantity *
                </FieldLabel>
                <Input
                  {...field}
                  id={`${fieldIdPrefix}-quantity`}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  className={inputClassName}
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            name={`products.${index}.costPrice`}
            control={control}
            render={({ field, fieldState }) => (
              <Field className="gap-1" data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor={`${fieldIdPrefix}-cost-price`}
                  className="text-sm font-normal text-active"
                >
                  Cost Price *
                </FieldLabel>
                <Input
                  {...field}
                  id={`${fieldIdPrefix}-cost-price`}
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  step="0.01"
                  className={inputClassName}
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            name={`products.${index}.expiryDate`}
            control={control}
            render={({ field, fieldState }) => (
              <Field className="gap-1" data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor={`${fieldIdPrefix}-expiry-date`}
                  className="text-sm font-normal text-active"
                >
                  Expiry Date *
                </FieldLabel>
                <Input
                  {...field}
                  id={`${fieldIdPrefix}-expiry-date`}
                  type="date"
                  className={inputClassName}
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>
      </div>
    </fieldset>
  );
}
