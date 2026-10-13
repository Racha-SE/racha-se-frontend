import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
}

export function QuantityStepper({ value, onChange }: QuantityStepperProps) {
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
        className="h-8 w-14 bg-textbox text-center"
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
        onClick={() => onChange(value + 1)}
      >
        <Plus className="size-5" />
      </Button>
    </div>
  );
}
