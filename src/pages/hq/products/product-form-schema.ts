import { z } from "zod";

export const productStatuses = ["active", "inactive"] as const;

const sellingPriceSchema = z
  .string()
  .trim()
  .min(1, "Selling price is required")
  .regex(
    /^\d+(?:\.\d{1,2})?$/,
    "Selling price must have no more than 2 decimal places",
  )
  .transform(Number)
  .pipe(z.number().positive("Selling price must be greater than 0"));

export const productFormSchema = z.object({
  productName: z.string().trim().min(1, "Product name is required"),
  sellingPrice: sellingPriceSchema,
  category: z.string().trim().min(1, "Category is required"),
  status: z.enum(productStatuses, {
    error: "Status is required",
  }),
});

export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormValues = z.output<typeof productFormSchema>;
