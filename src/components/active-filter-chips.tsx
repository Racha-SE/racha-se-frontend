import { XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export interface ActiveFilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

interface ActiveFilterChipsProps {
  chips: ActiveFilterChip[];
}

export function ActiveFilterChips({ chips }: ActiveFilterChipsProps) {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Filters:</span>
      {chips.map((chip) => (
        <Badge key={chip.key} variant="secondary" className="gap-1 py-1 pr-1">
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            aria-label={`Remove ${chip.label} filter`}
            className="cursor-pointer rounded-full p-0.5 hover:bg-foreground/10"
          >
            <XIcon className="size-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
}
