import { Navigate, createBrowserRouter } from "react-router-dom";
import { BranchPage } from "./pages/branch/branch-page";
import { CashierPage } from "./pages/cashier/cashier-page";
import { HqPage } from "./pages/hq/hq-page";
import { InventoryListPage } from "./pages/hq/inventory/inventory-list-page";
import { AddOrderPage } from "./pages/hq/orders/add-order-page";
import { AddProductPage } from "./pages/hq/products/add-product-page";
import { EditProductPage } from "./pages/hq/products/edit-product-page";
import { ProductListPage } from "./pages/hq/products/product-list-page";

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
    path: "/hq/inventory",
    element: <InventoryListPage />,
  },
  {
    path: "/hq/orders/new",
    element: <AddOrderPage />,
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
]);
