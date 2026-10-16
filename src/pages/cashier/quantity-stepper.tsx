import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  hasError?: boolean;
}

export function QuantityStepper({
  value,
  onChange,
  max,
  hasError = false,
}: QuantityStepperProps) {
  const isPlusDisabled = max !== undefined && value > max;

  return (
    <div className="flex items-center gap-1.5">
      <Button
        type="button"
        size="icon-lg"
        className="rounded-full bg-focus hover:bg-focus/80"
        aria-label="Decrease quantity"
        disabled={value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
      >
        <Minus className="size-5" />
      </Button>
      <Input
        className={cn(
          "h-8 w-14 bg-textbox text-center",
          hasError &&
            "border-2 border-base-red-bright focus-visible:border-base-red-bright focus-visible:ring-0",
        )}
        inputMode="numeric"
        aria-label="Quantity"
        value={value}
        onChange={(event) => {
          const nextValue = Number.parseInt(event.target.value, 10);
          onChange(Number.isNaN(nextValue) ? 1 : Math.max(1, nextValue));
        }}
      />
      <Button
        type="button"
        size="icon-lg"
        className="rounded-full bg-focus hover:bg-focus/80"
        aria-label="Increase quantity"
        disabled={isPlusDisabled}
        onClick={() => onChange(value + 1)}
      >
        <Plus className="size-5" />
      </Button>
    </div>
  );
}
