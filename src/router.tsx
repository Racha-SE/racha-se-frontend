import { Navigate, Outlet, createBrowserRouter } from "react-router-dom";
import { HomeRedirect } from "@/components/home-redirect";
import { RequireAuth } from "@/components/require-auth";
import { RequireRole } from "@/components/require-role";
import { RequireRoot } from "@/components/require-root";
import { AccessDeniedPage } from "./pages/access-denied/access-denied-page";
import { BranchPage } from "./pages/branch/branch-page";
import { BranchAnalyticsPage } from "./pages/branch/analytics/branch-analytics-page";
import { BranchInventoryPage } from "./pages/branch/inventory/branch-inventory-page";
import { BranchNotificationsPage } from "./pages/branch/notifications/branch-notifications-page";
import { BranchOrderDetailsPage } from "./pages/branch/orders/branch-order-details-page";
import { CreateBranchOrderPage } from "./pages/branch/orders/create-branch-order-page";
import { BranchOrderPage } from "./pages/branch/orders/branch-order-page";
import { BranchReportsPage } from "./pages/branch/reports/branch-reports-page";
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
import { AnalyticsPage } from "./pages/hq/analytics/analytics-page";
import { ReportsPage } from "./pages/hq/reports/reports-page";
import { AddUserPage } from "./pages/user-management/add-user-page";
import { UserDetailPage } from "./pages/user-management/user-detail-page";
import { RequisitionListPage } from "@/pages/hq/requisitions/requisition-list-page";
import { RequisitionDetailPage } from "@/pages/hq/requisitions/requisition-detail-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeRedirect />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            path: "/access-denied",
            element: <AccessDeniedPage />,
          },
          {
            path: "/change-password",
            element: <ChangePasswordPage />,
          },
          {
            element: <RequireRole allow={["hq"]} />,
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
                path: "/hq/analytics",
                element: <AnalyticsPage />,
              },
              {
                path: "/hq/reports",
                element: <ReportsPage />,
              },
              {
                path: "/hq/requisitions",
                element: <RequisitionListPage />,
              },
              {
                path: "/hq/requisitions/:lotId",
                element: <RequisitionDetailPage />,
              },
            ],
          },
          {
            element: <RequireRole allow={["branch"]} />,
            children: [
              {
                path: "/branch",
                element: <BranchPage />,
              },
              {
                path: "/branch/inventory",
                element: <BranchInventoryPage />,
              },
              {
                path: "/branch/notifications",
                element: <BranchNotificationsPage />,
              },
              {
                path: "/branch/analytics",
                element: <BranchAnalyticsPage />,
              },
              {
                path: "/branch/reports",
                element: <BranchReportsPage />,
              },
            ],
          },
          {
            // Shared by hq and branch users.
            element: <RequireRole allow={["hq", "branch"]} />,
            children: [
              {
                path: "/branch/orders",
                element: <BranchOrderDetailsPage />,
              },
              {
                path: "/branch/orders/new",
                element: <CreateBranchOrderPage />,
              },
              {
                path: "/branch/orders/:lotId",
                element: <BranchOrderPage />,
              },
            ],
          },
          {
            element: <RequireRole allow={["cashier"]} />,
            children: [
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
