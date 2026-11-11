import { z } from "zod";

// Today as YYYY-MM-DD in the user's own timezone, the same shape a date
// input produces, so the two compare as plain strings.
function todayDateInputValue() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

const receiveStockLineSchema = z
  .object({
    bodId: z.number().int().positive(),
    // Carried with each line (not shown as an input) so the received
    // quantity can be checked against it.
    approvedQty: z.number().int().nonnegative(),
    receivedQty: z
      .string()
      .trim()
      .min(1, "Received Qty is required")
      .regex(/^\d+$/, "Received Qty must be a whole number")
      .transform(Number),
    expiryDate: z
      .string()
      .trim()
      .min(1, "Expiry Date is required")
      .refine(
        (date) => date >= todayDateInputValue(),
        "Expiry Date can't be in the past",
      ),
  })
  .refine((line) => line.receivedQty <= line.approvedQty, {
    message: "Received Qty can't be more than the approved quantity",
    path: ["receivedQty"],
  });

export const receiveStockFormSchema = z.object({
  items: z
    .array(receiveStockLineSchema)
    .min(1, "This requisition has no items to receive"),
});

export type ReceiveStockFormInput = z.input<typeof receiveStockFormSchema>;
export type ReceiveStockFormValues = z.output<typeof receiveStockFormSchema>;
