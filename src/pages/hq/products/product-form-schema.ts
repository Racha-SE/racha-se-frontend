import { z } from "zod";

export const productStatuses = ["active", "inactive"] as const;

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

function createMinimumStockSchema(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .regex(/^\d+$/, `${label} must be a whole number`)
    .transform(Number)
    .pipe(z.number().int().nonnegative());
}

export const productFormSchema = z.object({
  productName: z.string().trim().min(1, "Product name is required"),
  description: z.string().trim().optional(),
  sellingPrice: createPriceSchema("Selling price"),
  costPrice: createPriceSchema("Cost price"),
  category: z.string().trim().min(1, "Category is required"),
  minStockHq: createMinimumStockSchema("Minimum stock HQ"),
  minStockBranch: createMinimumStockSchema("Minimum stock Branch"),
  status: z.enum(productStatuses, {
    error: "Status is required",
  }),
});

export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormValues = z.output<typeof productFormSchema>;
