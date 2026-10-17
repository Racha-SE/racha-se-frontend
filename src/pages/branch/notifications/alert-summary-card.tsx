import { cn } from "@/lib/utils";

interface AlertSummaryCardProps {
  label: string;
  value: number;
  valueClassName?: string;
}

export function AlertSummaryCard({
  label,
  value,
  valueClassName,
}: AlertSummaryCardProps) {
  return (
    <div className="rounded-xl border border-border bg-background px-4 py-3">
      <p className="m-0 text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "m-0 mt-1 text-3xl font-semibold text-foreground",
          valueClassName,
        )}
      >
        {value}
      </p>
    </div>
  );
}
