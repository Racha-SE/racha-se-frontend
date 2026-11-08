import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import { getPendingBranchOrderCount } from "@/api/orders-branch";
import { REQUISITIONS_CHANGED_EVENT } from "@/api/hq-requisitions";
import { Badge } from "@/components/ui/badge";

export function HqRequisitionsNav() {
  const [count, setCount] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    let version = 0;

    async function refresh() {
      const request = ++version;

      try {
        const nextCount = await getPendingBranchOrderCount();

        if (active && request === version) {
          setCount(nextCount);
          setFailed(false);
        }
      } catch {
        if (active && request === version) {
          setFailed(true);
        }
      }
    }

    void refresh();

    const timer = window.setInterval(refresh, 30000);

    window.addEventListener("focus", refresh);
    window.addEventListener(REQUISITIONS_CHANGED_EVENT, refresh);

    return () => {
      active = false;

      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      window.removeEventListener(REQUISITIONS_CHANGED_EVENT, refresh);
    };
  }, []);

  return (
    <div className="flex justify-center">
      <NavLink
        to="/hq/requisitions?status=pending"
        className={({ isActive }) =>
          `flex h-10 w-[90%] items-center justify-center gap-2 rounded-xl text-sm shadow-xs ${
            isActive ? "bg-focus text-white" : "bg-sidebar-top"
          }`
        }
      >
        Requisitions
        <Badge
          variant="secondary"
          title={
            failed
              ? "Pending count unavailable. Retrying automatically."
              : "Pending requisitions"
          }
          aria-label={
            failed
              ? "Pending count unavailable"
              : `${count ?? "Loading"} pending requisitions`
          }
        >
          {failed ? "!" : (count ?? "…")}
        </Badge>
      </NavLink>
    </div>
  );
}
