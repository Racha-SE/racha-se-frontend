import { Navigate, Outlet } from "react-router-dom";

import { useSession, type UserType } from "@/lib/auth-client";

type RequireRoleProps = {
  /** userType values allowed to see the nested routes. */
  allow: UserType[];
};

export function RequireRole({ allow }: RequireRoleProps) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <p className="p-6 text-center">Loading...</p>;
  }

  if (!session) {
    return <Navigate to="/sign-in" replace />;
  }

  if (!allow.includes(session.user.userType)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
}
