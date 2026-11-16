import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  receiveStockFormSchema,
  type ReceiveStockFormInput,
  type ReceiveStockFormValues,
} from "./receive-stock-form-schema";

export type ReceiveStockLine = {
  bodId: number;
  productName: string;
  approvedQty: number;
};

interface ReceiveStockFormProps {
  lines: readonly ReceiveStockLine[];
  defaultValues: ReceiveStockFormInput;
  disabled?: boolean;
  onSubmit: (values: ReceiveStockFormValues) => void | Promise<void>;
  onCancel: () => void;
}

const inputClassName =
  "h-9 w-full max-w-[200px] rounded-md bg-textbox px-3 py-2 text-sm";

export function ReceiveStockForm({
  lines,
  defaultValues,
  disabled = false,
  onSubmit,
  onCancel,
}: ReceiveStockFormProps) {
  const form = useForm<ReceiveStockFormInput, unknown, ReceiveStockFormValues>({
    resolver: zodResolver(receiveStockFormSchema),
    defaultValues,
  });
  const { errors, isSubmitting } = form.formState;
  const hasInvalidFields = Object.keys(errors).length > 0;

  return (
    <form
      className="w-full max-w-4xl text-sm"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className="overflow-hidden rounded-lg border border-border/60 bg-white p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold text-sidebar-top">
                Product
              </TableHead>
              <TableHead className="font-bold text-sidebar-top">
                Approved Qty
              </TableHead>
              <TableHead className="font-bold text-sidebar-top">
                Received Qty *
              </TableHead>
              <TableHead className="font-bold text-sidebar-top">
                Expiry Date *
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map((line, index) => {
              const fieldIdPrefix = `receive-line-${line.bodId}`;

              return (
                <TableRow key={line.bodId}>
                  <TableCell className="align-top py-4 text-sidebar-top">
                    {line.productName}
                  </TableCell>
                  <TableCell className="align-top py-4 text-sidebar-top">
                    {line.approvedQty}
                  </TableCell>
                  <TableCell className="align-top py-3">
                    <Controller
                      name={`items.${index}.receivedQty`}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field
                          className="gap-1"
                          data-invalid={fieldState.invalid}
                        >
                          <FieldLabel
                            htmlFor={`${fieldIdPrefix}-qty`}
                            className="sr-only"
                          >
                            Received Qty for {line.productName}
                          </FieldLabel>
                          <Input
                            {...field}
                            id={`${fieldIdPrefix}-qty`}
                            type="number"
                            inputMode="numeric"
                            min="0"
                            max={line.approvedQty}
                            step="1"
                            disabled={disabled}
                            className={inputClassName}
                            aria-invalid={fieldState.invalid}
                          />
                          <FieldError errors={[fieldState.error]} />
                        </Field>
                      )}
                    />
                  </TableCell>
                  <TableCell className="align-top py-3">
                    <Controller
                      name={`items.${index}.expiryDate`}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field
                          className="gap-1"
                          data-invalid={fieldState.invalid}
                        >
                          <FieldLabel
                            htmlFor={`${fieldIdPrefix}-expiry`}
                            className="sr-only"
                          >
                            Expiry Date for {line.productName}
                          </FieldLabel>
                          <Input
                            {...field}
                            id={`${fieldIdPrefix}-expiry`}
                            type="date"
                            disabled={disabled}
                            className={inputClassName}
                            aria-invalid={fieldState.invalid}
                          />
                          <FieldError errors={[fieldState.error]} />
                        </Field>
                      )}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {hasInvalidFields && (
        <p className="mt-4 text-sm text-destructive" role="alert">
          Please fix the highlighted fields before confirming receipt.
        </p>
      )}

      <div className="mt-6 flex gap-3">
        <Button
          type="submit"
          className="h-auto rounded-[6px] px-4 py-2 text-sm"
          disabled={disabled || isSubmitting}
        >
          {isSubmitting ? "Confirming..." : "Confirm receipt"}
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
