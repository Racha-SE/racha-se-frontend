import { Navigate, createBrowserRouter } from "react-router-dom";
import { BranchPage } from "./pages/branch/branch-page";
import { CashierPage } from "./pages/cashier/cashier-page";
import { HqPage } from "./pages/hq/hq-page";
import { Layout } from "@/layouts/layout";
import { UserManagementPage } from "./pages/user-management/user-management-page";
import { ChangePasswordPage } from "./pages/user-management/change-password-page";
import { ResetPasswordPage } from "./pages/user-management/reset-password-page";
import { AddProductPage } from "./pages/hq/products/add-product-page";
import { EditProductPage } from "./pages/hq/products/edit-product-page";
import { ProductListPage } from "./pages/hq/products/product-list-page";
import { AddUserPage } from "./pages/user-management/add-user-page";
import { UserDetailPage } from "./pages/user-management/user-detail-page";

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
    path: "/hq/products",
    element: <ProductListPage />,
  },
  {
    path: "/hq/products/new",
    element: <AddProductPage />,
  },
  {
    path: "/hq/products/:productId/edit",
    element: <EditProductPage />,
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
        path: "/user-management/add",
        element: <AddUserPage />,
      },
      {
        path: "/user-management/:id",
        element: <UserDetailPage />,
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
