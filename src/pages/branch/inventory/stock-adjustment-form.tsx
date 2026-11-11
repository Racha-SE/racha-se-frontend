import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";

import type { BranchInventoryProduct } from "@/api/inventory";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  createStockAdjustmentFormSchema,
  type StockAdjustmentFormInput,
  type StockAdjustmentFormValues,
} from "./stock-adjustment-form-schema";

interface StockAdjustmentFormProps {
  products: readonly BranchInventoryProduct[];
  onSubmit: (values: StockAdjustmentFormValues) => Promise<void>;
  onCancel: () => void;
}

const inputClassName = "h-9 rounded-md bg-textbox px-3 py-2 text-sm";

function RequiredLabel({ htmlFor, label }: { htmlFor: string; label: string }) {
  return (
    <FieldLabel htmlFor={htmlFor} className="text-sm font-medium">
      {label} <span className="text-destructive">*</span>
    </FieldLabel>
  );
}

export function StockAdjustmentForm({
  products,
  onSubmit,
  onCancel,
}: StockAdjustmentFormProps) {
  const onHandByPId = useMemo(
    () => new Map(products.map((item) => [item.pId, item.quantity])),
    [products],
  );
  const schema = useMemo(
    () => createStockAdjustmentFormSchema((pId) => onHandByPId.get(pId)),
    [onHandByPId],
  );

  const form = useForm<
    StockAdjustmentFormInput,
    unknown,
    StockAdjustmentFormValues
  >({
    resolver: zodResolver(schema),
    defaultValues: { pId: "", quantityChange: "", reason: "" },
  });
  const { isSubmitting } = form.formState;

  const productItems = products.map((item) => ({
    value: String(item.pId),
    label: `${item.productName} (on hand: ${item.quantity})`,
  }));

  // Live "on hand: before -> after" so the user sees the effect before
  // confirming. Only shown once both inputs make sense.
  const [selectedPId, quantityText] = useWatch({
    control: form.control,
    name: ["pId", "quantityChange"],
  });
  const onHand = selectedPId ? onHandByPId.get(Number(selectedPId)) : undefined;
  const change = /^[+-]?\d+$/.test(quantityText.trim())
    ? Number(quantityText)
    : null;
  const preview =
    onHand !== undefined && change !== null && change !== 0
      ? { before: onHand, after: onHand + change }
      : null;

  return (
    <form
      className="w-full max-w-xl space-y-5 text-sm"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <Controller
        name="pId"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field className="gap-1.5" data-invalid={fieldState.invalid}>
            <RequiredLabel htmlFor="adjustment-product" label="Product" />
            <Select
              items={productItems}
              value={field.value || null}
              onValueChange={(value) => field.onChange(value ?? "")}
            >
              <SelectTrigger
                id="adjustment-product"
                className="h-9! w-full rounded-md bg-textbox px-3 text-sm"
                onBlur={field.onBlur}
                aria-invalid={fieldState.invalid}
              >
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent align="start" alignItemWithTrigger={false}>
                {productItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <Controller
        name="quantityChange"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field className="gap-1.5" data-invalid={fieldState.invalid}>
            <RequiredLabel
              htmlFor="adjustment-quantity"
              label="Adjustment Qty (+/−)"
            />
            <Input
              {...field}
              id="adjustment-quantity"
              inputMode="numeric"
              placeholder="e.g. -3 to remove, 5 to add"
              className={inputClassName}
              aria-invalid={fieldState.invalid}
            />
            {preview && (
              <p className="m-0 text-xs text-muted-foreground">
                On hand: {preview.before} → {preview.after}
              </p>
            )}
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <Controller
        name="reason"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field className="gap-1.5" data-invalid={fieldState.invalid}>
            <RequiredLabel htmlFor="adjustment-reason" label="Reason" />
            <Input
              {...field}
              id="adjustment-reason"
              maxLength={255}
              placeholder="e.g. damaged in storage, recount found extra"
              className={inputClassName}
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <div className="flex gap-3 pt-1">
        <Button
          type="submit"
          className="h-auto rounded-[6px] px-4 py-2 text-sm"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Confirm"}
        </Button>
        <Button
          type="button"
          className="h-auto rounded-[6px] bg-destructive-active px-4 py-2 text-sm text-primary-foreground hover:bg-destructive"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
