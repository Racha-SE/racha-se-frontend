import { z } from "zod";

export const userRoles = ["hq", "branch", "cashier"] as const;

export const userFormSchema = z
  .object({
    firstname: z.string().trim().min(1, "First name is required"),
    lastname: z.string().trim().min(1, "Last name is required"),
    username: z.string().trim().min(1, "Username is required"),
    email: z.string().trim().min(1, "Gmail is required"),
    password: z.string().min(8, "Password must contain at least 8 characters"),
    role: z.enum(userRoles, { error: "Role is required" }),
    branchId: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.role !== "hq" && data.branchId.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["branchId"],
        message: "Branch is required",
      });
    }
  });

export type UserFormInput = z.input<typeof userFormSchema>;

export type UserFormValues = z.output<typeof userFormSchema>;
