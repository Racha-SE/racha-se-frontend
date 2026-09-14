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
  categories: readonly { label: string; value: string }[];
  suppliers: readonly { label: string; value: string }[];
  onSubmit: (values: OrderFormValues) => void | Promise<void>;
  onCancel: () => void;
}

const emptyProduct: OrderFormInput["products"][number] = {
  productName: "",
  category: "",
  supplier: "",
  quantity: "",
  costPrice: "",
  expiryDate: "",
};

export function OrderForm({
  categories,
  suppliers,
  onSubmit,
  onCancel,
}: OrderFormProps) {
  const form = useForm<OrderFormInput, unknown, OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      products: [{ ...emptyProduct }],
    },
  });
  const { fields, append } = useFieldArray({
    control: form.control,
    name: "products",
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
            categories={categories}
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
