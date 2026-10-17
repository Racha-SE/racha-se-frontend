import { CircleAlert } from "lucide-react";

import { cn } from "@/lib/utils";

interface StockErrorMessageProps {
  message: string;
  className?: string;
}

export function StockErrorMessage({
  message,
  className,
}: StockErrorMessageProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-row items-center gap-1 text-xs text-base-red-bright",
        className,
      )}
    >
      <CircleAlert className="mt-0.5 size-3 shrink-0" />
      <p className="m-0 leading-tight">{message}</p>
    </div>
  );
}
