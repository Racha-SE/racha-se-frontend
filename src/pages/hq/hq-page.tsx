import { Link } from "react-router-dom";

import { buttonVariants } from "@/components/ui/button";

export function HqPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-active">HQ page</h1>
      <Link
        to="/hq/notifications"
        className={buttonVariants({ variant: "outline" })}
      >
        View notifications
      </Link>
    </div>
  );
}
