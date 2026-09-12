import { Navigate, createBrowserRouter } from "react-router-dom";
import { BranchPage } from "./pages/branch/branch-page";
import { CashierPage } from "./pages/cashier/cashier-page";
import { HqPage } from "./pages/hq/hq-page";
import { Layout } from "@/layouts/layout";
import { UserManagementPage } from "./pages/user-management/user-management-page";
import { ChangePasswordPage } from "./pages/user-management/change-password-page";
import { ResetPasswordPage } from "./pages/user-management/reset-password-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/hq" replace />,
  },
  {
    path: "/hq",
    element: <HqPage />,
  },
  {
    path: "/branch",
    element: <BranchPage />,
  },
  {
    path: "/cashier",
    element: <CashierPage />,
  },
  {
    element: <Layout />,
    children: [
      {
        path: "/user-management",
        element: <UserManagementPage />,
      },
      {
        path: "/change-password",
        element: <ChangePasswordPage />,
      },
      {
        path: "/reset-password",
        element: <ResetPasswordPage />,
      },
    ],
  },
]);
