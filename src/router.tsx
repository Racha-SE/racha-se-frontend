import { Navigate, createBrowserRouter } from "react-router-dom";
import { RequireAuth } from "@/components/require-auth";
import { RequireRoot } from "@/components/require-root";
import { BranchPage } from "./pages/branch/branch-page";
import { CashierPage } from "./pages/cashier/cashier-page";
import { Layout } from "@/layouts/layout";
import { UserManagementPage } from "./pages/user-management/user-management-page";
import { ChangePasswordPage } from "./pages/user-management/change-password-page";
import { ResetPasswordPage } from "./pages/user-management/reset-password-page";
import { SignInPage } from "./pages/sign-in/sign-in-page";
import { CategoryListPage } from "./pages/hq/products/categories/category-list-page";
import { InventoryListPage } from "./pages/hq/inventory/inventory-list-page";
import { HqNotificationsPage } from "./pages/hq/notifications/hq-notifications-page";
import { AddOrderPage } from "./pages/hq/orders/add-order-page";
import { AddProductPage } from "./pages/hq/products/add-product-page";
import { EditProductPage } from "./pages/hq/products/edit-product-page";
import { ProductListPage } from "./pages/hq/products/product-list-page";
import { AddUserPage } from "./pages/user-management/add-user-page";
import { UserDetailPage } from "./pages/user-management/user-detail-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/hq/products" replace />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            path: "/hq/products",
            element: <ProductListPage />,
          },
          {
            path: "/hq/products/categories",
            element: <CategoryListPage />,
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
            path: "/hq/inventory",
            element: <InventoryListPage />,
          },
          {
            path: "/hq/notifications",
            element: <HqNotificationsPage />,
          },
          {
            path: "/hq/orders/new",
            element: <AddOrderPage />,
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
            element: <RequireRoot />,
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
            ],
          },
          {
            path: "/change-password",
            element: <ChangePasswordPage />,
          },
        ],
      },
    ],
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "/sign-in",
    element: <SignInPage />,
  },
]);
