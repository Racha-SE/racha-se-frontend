import { z } from "zod";

/**
 * Built per render with the branch's current on-hand counts, so a removal
 * larger than what's on the shelf is caught before it reaches the backend.
 */
export function createStockAdjustmentFormSchema(
  getOnHand: (pId: number) => number | undefined,
) {
  return z
    .object({
      pId: z.string().min(1, "Product is required").transform(Number),
      quantityChange: z
        .string()
        .trim()
        .min(1, "Adjustment Qty is required")
        .regex(
          /^[+-]?\d+$/,
          "Adjustment Qty must be a whole number, e.g. -3 or 5",
        )
        .transform(Number)
        .refine((value) => value !== 0, "Adjustment Qty can't be 0")
        .refine(
          (value) => Math.abs(value) <= 10000,
          "Adjustment Qty must be between -10000 and 10000",
        ),
      reason: z
        .string()
        .trim()
        .min(1, "Reason is required")
        .max(255, "Reason must be 255 characters or fewer"),
    })
    .superRefine((values, ctx) => {
      const onHand = getOnHand(values.pId);
      if (
        values.quantityChange < 0 &&
        onHand !== undefined &&
        -values.quantityChange > onHand
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["quantityChange"],
          message: `You can't remove more than is on hand (${onHand})`,
        });
      }
    });
}

export type StockAdjustmentFormInput = z.input<
  ReturnType<typeof createStockAdjustmentFormSchema>
>;
export type StockAdjustmentFormValues = z.output<
  ReturnType<typeof createStockAdjustmentFormSchema>
>;
