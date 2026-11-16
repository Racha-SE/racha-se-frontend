import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { getHomePath } from "@/lib/home-path";

export function AccessDeniedPage() {
  const { data: session } = useSession();
  const homePath = session ? getHomePath(session.user) : "/sign-in";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background p-6 text-center text-foreground">
      <ShieldAlert className="size-10 text-destructive" aria-hidden="true" />
      <h1 className="m-0 text-xl font-semibold text-active">Access denied</h1>
      <p className="m-0 max-w-sm text-sm text-muted-foreground">
        You don&apos;t have permission to view this page.
      </p>
      <Link to={homePath} className={buttonVariants()}>
        Go to my home page
      </Link>
    </main>
  );
}
