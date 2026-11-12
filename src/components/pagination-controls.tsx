import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Turns the current page number into an input for typing a page. */
  jumpable?: boolean;
}

export function PaginationControls({
  page,
  totalPages,
  onPageChange,
  jumpable = false,
}: PaginationControlsProps) {
  const [draft, setDraft] = useState<string | null>(null);

  // Out-of-range or non-numeric input falls back to the current page.
  function commitDraft() {
    const target = Number(draft);
    setDraft(null);
    if (Number.isInteger(target) && target >= 1 && target !== page) {
      onPageChange(Math.min(target, totalPages));
    }
  }

  return (
    <nav className="flex items-center gap-1" aria-label="Pagination">
      <Button
        type="button"
        variant="ghost"
        size="xs"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        ‹
      </Button>
      {jumpable ? (
        <Input
          className="h-6 w-12 px-1 text-center text-xs md:text-xs"
          inputMode="numeric"
          aria-label="Go to page"
          value={draft ?? String(page)}
          onFocus={(event) => event.target.select()}
          onChange={(event) => setDraft(event.target.value.replace(/\D/g, ""))}
          onBlur={commitDraft}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
            if (event.key === "Escape") setDraft(null);
          }}
        />
      ) : (
        <Button type="button" variant="default" size="xs" aria-current="page">
          {page}
        </Button>
      )}
      {jumpable && (
        <span className="text-xs text-muted-foreground">/ {totalPages}</span>
      )}
      <Button
        type="button"
        variant="ghost"
        size="xs"
        aria-label="Next page"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        ›
      </Button>
    </nav>
  );
}
