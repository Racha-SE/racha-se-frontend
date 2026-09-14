import { z } from "zod";

function createPriceSchema(label: string) {
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
  pId: z
    .string()
    .trim()
    .min(1, "Product is required")
    .transform(Number)
    .pipe(z.number().int().positive("Product is required")),
  supplierId: z
    .string()
    .trim()
    .min(1, "Supplier is required")
    .transform(Number)
    .pipe(z.number().int().positive("Supplier is required")),
  amount: z
    .string()
    .trim()
    .min(1, "Quantity is required")
    .regex(/^\d+$/, "Quantity must be a whole number")
    .transform(Number)
    .pipe(z.number().int().positive("Quantity must be greater than 0")),
  basePrice: createPriceSchema("Cost price"),
  expiryDate: z.string().trim().min(1, "Expiry date is required"),
});

export const orderFormSchema = z.object({
  items: z
    .array(orderProductSchema)
    .min(1, "An order must contain at least one product"),
});

export type OrderFormInput = z.input<typeof orderFormSchema>;
export type OrderFormValues = z.output<typeof orderFormSchema>;
