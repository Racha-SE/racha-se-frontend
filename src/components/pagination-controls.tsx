import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  page,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
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
      <Button type="button" variant="default" size="xs" aria-current="page">
        {page}
      </Button>
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
