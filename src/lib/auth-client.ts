import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export type UserType = "hq" | "branch" | "cashier" | "customer";

const backendOrigin = new URL(import.meta.env.VITE_API_BASE_URL).origin;

export const authClient = createAuthClient({
  baseURL: backendOrigin,
  basePath: "/api/v1/auth",
  plugins: [
    inferAdditionalFields({
      user: {
        userType: { type: ["hq", "branch", "cashier", "customer"] },
        firstname: { type: "string" },
        lastname: { type: "string" },
        username: { type: "string" },
        branchId: { type: "number", required: false },
      },
    }),
  ],
});

export const { useSession, signIn, signOut } = authClient;
