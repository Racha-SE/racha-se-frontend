import { Navigate } from "react-router-dom";

import { useSession } from "@/lib/auth-client";
import { getHomePath } from "@/lib/home-path";

export function HomeRedirect() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <p className="p-6 text-center">Loading...</p>;
  }

  if (!session) {
    return <Navigate to="/sign-in" replace />;
  }

  return <Navigate to={getHomePath(session.user)} replace />;
}
