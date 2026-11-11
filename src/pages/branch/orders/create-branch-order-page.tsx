import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { PackagePlus, Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";

import { ApiError } from "@/api/client";
import { createBranchOrder } from "@/api/orders-branch";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSession } from "@/lib/auth-client";
import { ProductSearchSelect } from "@/pages/hq/orders/product-search-select";

// type="number" gives "" for non-numeric text too, so empty and invalid share one message.
const INVALID_AMOUNT = "Quantity must be an integer greater than 0";

// Backend puts a human-readable reason in error.context (message, or summary for schema errors).
function backendMessage(err: unknown) {
  if (!(err instanceof ApiError)) return null;
  const context = (
    err.body as { error?: { context?: Record<string, unknown> } }
  )?.error?.context;
  const message = context?.message ?? context?.summary;
  return typeof message === "string" ? message : null;
}

const schema = z.object({
  items: z
    .array(
      z.object({
        pId: z
          .string()
          .min(1, "Product is required")
          .transform(Number)
          .pipe(z.number().int().positive("Product is required")),
        amount: z
          .string()
          .trim()
          .min(1, INVALID_AMOUNT)
          .regex(/^\d+$/, INVALID_AMOUNT)
          .transform(Number)
          .pipe(
            z
              .number()
              .positive(INVALID_AMOUNT)
              // Mirrors the backend limit in orders-branch.model.ts (its own message is unreadable).
              .max(10000, "Quantity must be at most 10000"),
          ),
      }),
    )
    .min(1, "An order must contain at least one product")
    .superRefine((items, ctx) => {
      const seen = new Set<number>();
      items.forEach((item, index) => {
        if (seen.has(item.pId)) {
          ctx.addIssue({
            code: "custom",
            path: [index, "pId"],
            message: "Duplicate product",
          });
        }
        seen.add(item.pId);
      });
    }),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

const emptyItem = { pId: "", amount: "" };
const LIST_PATH = "/branch/orders/details";

export function CreateBranchOrderPage() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { items: [{ ...emptyItem }] },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  if (isPending) return <p className="p-6 text-center">Loading...</p>;
  // Only branch users may create branch orders.
  if (session?.user.userType !== "branch") {
    return <Navigate to={LIST_PATH} replace />;
  }

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      await createBranchOrder(values);
      navigate(LIST_PATH);
    } catch (err) {
      setError(
        backendMessage(err) ?? "Couldn't create the order. Please try again.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-background p-6 text-left text-foreground">
      <header className="flex h-12 items-center gap-3 rounded-md bg-textbox px-3">
        <PackagePlus className="size-5" aria-hidden="true" />
        <h1 className="m-0 text-xl font-semibold tracking-normal text-active">
          Create Branch Order
        </h1>
      </header>

      <form
        className="mt-4 max-w-3xl space-y-6 px-2 text-sm"
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {error && (
          <p className="text-destructive" role="alert">
            {error}
          </p>
        )}

        {fields.map((field, index) => (
          <fieldset
            key={field.id}
            className="space-y-4 border-b border-border pb-6"
          >
            <legend className="mb-2 flex items-center gap-2 font-medium text-active">
              Product {index + 1} *
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Remove product ${index + 1}`}
                  onClick={() => remove(index)}
                >
                  <Trash2 />
                </Button>
              )}
            </legend>

            <Controller
              name={`items.${index}.pId`}
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="gap-1" data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor={`item-${index}-product`}
                    className="text-sm font-normal text-active"
                  >
                    Product *
                  </FieldLabel>
                  <ProductSearchSelect
                    id={`item-${index}-product`}
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name={`items.${index}.amount`}
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="gap-1" data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor={`item-${index}-amount`}
                    className="text-sm font-normal text-active"
                  >
                    Quantity *
                  </FieldLabel>
                  <Input
                    {...field}
                    id={`item-${index}-amount`}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    className="h-9 w-full max-w-[280px] rounded-md bg-textbox px-3 py-2 text-sm"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </fieldset>
        ))}

        <Button
          type="button"
          variant="outline"
          className="h-auto rounded-[6px] px-3 py-2 text-sm"
          onClick={() => append({ ...emptyItem })}
        >
          <Plus />
          Add a new product
        </Button>

        <div className="flex gap-3 pb-3">
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
            onClick={() => navigate(LIST_PATH)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </main>
  );
}
