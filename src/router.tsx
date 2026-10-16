import { Navigate, Outlet, createBrowserRouter } from "react-router-dom";
import { RequireAuth } from "@/components/require-auth";
import { RequireRoot } from "@/components/require-root";
import { BranchPage } from "./pages/branch/branch-page";
import { BranchInventoryPage } from "./pages/branch/inventory/branch-inventory-page";
import { CartProvider } from "./pages/cashier/cart-provider";
import { CashierPage } from "./pages/cashier/cashier-page";
import { OrderDetailsPage } from "./pages/cashier/order-details-page";
import { OrderListsPage } from "./pages/cashier/order-lists-page";
import { PaymentPage } from "./pages/cashier/payment-page";
import { Layout } from "@/layouts/layout";
import { UserManagementPage } from "./pages/user-management/user-management-page";
import { ChangePasswordPage } from "./pages/user-management/change-password-page";
import { ResetPasswordPage } from "./pages/user-management/reset-password-page";
import { SignInPage } from "./pages/sign-in/sign-in-page";
import { CategoryListPage } from "./pages/hq/products/categories/category-list-page";
import { InventoryListPage } from "./pages/hq/inventory/inventory-list-page";
import { HqNotificationsPage } from "./pages/hq/notifications/hq-notifications-page";
import { AddOrderPage } from "./pages/hq/orders/add-order-page";
import { BranchDetailPage } from "./pages/hq/branches/branch-detail-page";
import { BranchListPage } from "./pages/hq/branches/branch-list-page";
import { CreateBranchPage } from "./pages/hq/branches/create-branch-page";
import { EditBranchPage } from "./pages/hq/branches/edit-branch-page";
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
            path: "/hq/branches",
            element: <BranchListPage />,
          },
          {
            path: "/hq/branches/new",
            element: <CreateBranchPage />,
          },
          {
            path: "/hq/branches/:branchId",
            element: <BranchDetailPage />,
          },
          {
            path: "/hq/branches/:branchId/edit",
            element: <EditBranchPage />,
          },
          {
            path: "/branch",
            element: <BranchPage />,
          },
          {
            path: "/branch/inventory",
            element: <BranchInventoryPage />,
          },
          {
            element: (
              <CartProvider>
                <Outlet />
              </CartProvider>
            ),
            children: [
              {
                path: "/cashier",
                element: <CashierPage />,
              },
              {
                path: "/cashier/payment",
                element: <PaymentPage />,
              },
              {
                path: "/cashier/orders",
                element: <Navigate to="/cashier/order-lists" replace />,
              },
              {
                path: "/cashier/order-lists",
                element: <OrderListsPage />,
              },
              {
                path: "/cashier/order-details/:lotId",
                element: <OrderDetailsPage />,
              },
            ],
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
