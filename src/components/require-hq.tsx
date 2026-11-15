import { Outlet } from "react-router-dom";
import { useSession } from "@/lib/auth-client";

export function RequireHq() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <p className="p-6">Loading...</p>;
  }

  if (session?.user.userType !== "hq") {
    return (
      <p role="alert" className="p-6">
        Only HQ users can access requisitions.
      </p>
    );
  }

  return <Outlet />;
}
