import { z } from "zod";

export const branchStatuses = ["active", "inactive"] as const;

export const branchFormSchema = z.object({
  name: z.string().trim().min(1, "Branch name is required").max(255),
  address: z.string().trim().min(1, "Address is required").max(255),
  phoneNumber: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .regex(
      /^\+?[\d\s-]{9,20}$/,
      "Enter a valid phone number, e.g. 075-123-456",
    ),
  status: z.enum(branchStatuses),
});

export type BranchFormValues = z.infer<typeof branchFormSchema>;
