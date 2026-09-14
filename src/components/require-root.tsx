import { Navigate, Outlet } from "react-router-dom";

import { useSession } from "@/lib/auth-client";

export function RequireRoot() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <p className="p-6 text-center">Loading...</p>;
  }

  if (!session) {
    return <Navigate to="/sign-in" replace />;
  }

  if (session.user.role !== "admin") {
    return <Navigate to="/hq/products" replace />;
  }

  return <Outlet />;
}
