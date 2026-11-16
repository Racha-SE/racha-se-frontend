import type { UserType } from "@/lib/auth-client";

/** Where each kind of user lands: after sign-in, and from Access Denied. */
export function getHomePath(user: {
  role?: string | null;
  userType: UserType;
}) {
  if (user.role === "admin") return "/user-management";
  if (user.userType === "cashier") return "/cashier";
  if (user.userType === "branch") return "/branch/inventory";
  return "/hq/products";
}
