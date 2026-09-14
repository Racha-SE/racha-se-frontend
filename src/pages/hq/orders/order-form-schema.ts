import { z } from "zod";

function createPositiveNumberSchema(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .regex(
      /^\d+(?:\.\d{1,2})?$/,
      `${label} must have no more than 2 decimal places`,
    )
    .transform(Number)
    .pipe(z.number().positive(`${label} must be greater than 0`));
}

const orderProductSchema = z.object({
  productName: z.string().trim().min(1, "Product name is required"),
  category: z.string().trim().min(1, "Product category is required"),
  supplier: z.string().trim().min(1, "Supplier is required"),
  quantity: z
    .string()
    .trim()
    .min(1, "Quantity is required")
    .regex(/^\d+$/, "Quantity must be a whole number")
    .transform(Number)
    .pipe(z.number().int().positive("Quantity must be greater than 0")),
  costPrice: createPositiveNumberSchema("Cost price"),
  expiryDate: z.string().trim().min(1, "Expiry date is required"),
});

export const orderFormSchema = z.object({
  products: z
    .array(orderProductSchema)
    .min(1, "An order must contain at least one product"),
});

export type OrderFormInput = z.input<typeof orderFormSchema>;
export type OrderFormValues = z.output<typeof orderFormSchema>;
