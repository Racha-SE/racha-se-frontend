import { Navigate, createBrowserRouter } from "react-router-dom";
import { BranchPage } from "./pages/branch/branch-page";
import { CashierPage } from "./pages/cashier/cashier-page";
import { HqPage } from "./pages/hq/hq-page";
import { SignInPage } from "./pages/sign-in/sign-in-page";

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
    path: "/sign-in",
    element: <SignInPage />,
  },
]);
