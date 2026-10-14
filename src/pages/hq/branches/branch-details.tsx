import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function StatusBadge({
  isActive,
  className,
}: {
  isActive: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "w-fit rounded-full px-2.5 py-0.5 text-xs font-medium",
        isActive
          ? "bg-[#e6f6ec] text-[#1f7a3f]"
          : "bg-destructive-subtle text-destructive-active",
        className,
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

export function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <>
      <dt className="text-searchbar">{label}</dt>
      <dd className="m-0 whitespace-pre-line text-foreground">{children}</dd>
    </>
  );
}
