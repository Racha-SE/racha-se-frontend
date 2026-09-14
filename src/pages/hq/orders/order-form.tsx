import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";

import {
  orderFormSchema,
  type OrderFormInput,
  type OrderFormValues,
} from "./order-form-schema";
import { OrderProductFields } from "./order-product-fields";

interface OrderFormProps {
  suppliers: readonly { label: string; value: string }[];
  initialValues?: Partial<OrderFormInput>;
  onSubmit: (values: OrderFormValues) => void | Promise<void>;
  onCancel: () => void;
}

const emptyProduct: OrderFormInput["items"][number] = {
  pId: "",
  supplierId: "",
  amount: "",
  basePrice: "",
  expiryDate: "",
};

export function OrderForm({
  suppliers,
  initialValues = {},
  onSubmit,
  onCancel,
}: OrderFormProps) {
  const form = useForm<OrderFormInput, unknown, OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      items:
        initialValues.items && initialValues.items.length > 0
          ? initialValues.items
          : [{ ...emptyProduct }],
    },
  });
  const { fields, append } = useFieldArray({
    control: form.control,
    name: "items",
  });

  return (
    <form
      className="max-h-[calc(100vh-8rem)] w-full max-w-3xl overflow-y-auto pr-3 text-sm"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className="space-y-6">
        {fields.map((field, index) => (
          <OrderProductFields
            key={field.id}
            index={index}
            control={form.control}
            suppliers={suppliers}
          />
        ))}

        <Button
          type="button"
          variant="outline"
          className="h-auto rounded-[6px] px-3 py-2 text-sm"
          onClick={() => append({ ...emptyProduct })}
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
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
