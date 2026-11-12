import { useEffect, useState, type ReactNode } from "react";
import { Boxes, Eye } from "lucide-react";

import {
  getAllBranchesStockByProduct,
  type BranchInventoryProduct,
} from "@/api/inventory";
import { InventoryProductDetailDialog } from "@/components/inventory/inventory-product-detail-dialog";
import { toProduct } from "@/components/inventory/inventory-mappers";
import { PaginationControls } from "@/components/pagination-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { BranchStockBreakdown } from "./branch-stock-breakdown";

const itemsPerPage = 10;
const searchDebounceMs = 300;
const pollIntervalMs = 30_000;

interface CombinedStockViewProps {
  headerActions?: ReactNode;
}

export function CombinedStockView({ headerActions }: CombinedStockViewProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<BranchInventoryProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<BranchInventoryProduct | null>(null);

  useEffect(() => {
    let cancelled = false;

    // silent = background poll: keep the current table on screen, no spinner, no error.
    async function load(silent: boolean) {
      if (!silent) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const response = await getAllBranchesStockByProduct({
          search: search.trim() || undefined,
          limit: itemsPerPage,
          offset: (page - 1) * itemsPerPage,
        });
        if (cancelled) return;

        setItems(response.data.inventory);
        setTotalCount(response.data.totalCount);
      } catch {
        if (!cancelled && !silent) {
          setError("Couldn't load inventory. Please try again.");
          setItems([]);
        }
      } finally {
        if (!cancelled && !silent) setIsLoading(false);
      }
    }

    const timeout = window.setTimeout(() => void load(false), searchDebounceMs);
    const interval = window.setInterval(() => {
      if (!document.hidden) void load(true);
    }, pollIntervalMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [page, search]);

  const totalPages = Math.max(Math.ceil(totalCount / itemsPerPage), 1);

  return (
    <main className="min-h-screen bg-background p-6 text-left text-foreground">
      <header className="flex h-12 items-center gap-3 rounded-md bg-textbox px-3">
        <Boxes className="size-4.5 text-sidebar-top" aria-hidden="true" />
        <h1 className="m-0 text-xl font-semibold tracking-normal text-active">
          Inventory
        </h1>
      </header>

      <section className="mt-4 space-y-4 px-2">
        <div className="flex items-center justify-between gap-3">
          <Input
            className="h-8 max-w-[400px] rounded-sm border-border bg-searchbar px-3 text-primary-foreground placeholder:text-primary-foreground/70 focus-visible:border-focus focus-visible:ring-focus/20"
            value={search}
            placeholder="Search stock"
            aria-label="Search inventory"
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          <div className="flex items-center gap-3">{headerActions}</div>
        </div>

        {isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Loading inventory...
          </p>
        ) : error ? (
          <p className="py-8 text-center text-sm text-destructive">{error}</p>
        ) : totalCount === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No inventory found.
          </p>
        ) : (
          <>
            <div className="border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="h-auto border-r border-border px-4 py-2 font-semibold">
                      Product ID
                    </TableHead>
                    <TableHead className="h-auto border-r border-border px-4 py-2 font-semibold">
                      Product Category
                    </TableHead>
                    <TableHead className="h-auto border-r border-border px-4 py-2 font-semibold">
                      Product Name
                    </TableHead>
                    <TableHead className="h-auto border-r border-border px-4 py-2 font-semibold">
                      Total Quantity (all branches)
                    </TableHead>
                    <TableHead className="h-auto px-4 py-2 font-semibold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow
                      key={item.pId}
                      className="border-border even:bg-textbox hover:bg-primary-subtle"
                    >
                      <TableCell className="h-auto border-r border-border px-4 py-2">
                        {item.pId}
                      </TableCell>
                      <TableCell className="h-auto border-r border-border px-4 py-2">
                        {item.productCategory.join(", ") || "—"}
                      </TableCell>
                      <TableCell className="h-auto border-r border-border px-4 py-2">
                        {item.productName}
                      </TableCell>
                      <TableCell className="h-auto border-r border-border px-4 py-2">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="h-auto px-4 py-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          className="text-foreground [&_svg]:size-3.5!"
                          aria-label={`View ${item.productName} details`}
                          onClick={() => setSelected(item)}
                        >
                          <Eye />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between text-sm text-foreground">
              <span>
                Showing {items.length} of {totalCount} items
              </span>
              <PaginationControls
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </section>

      <InventoryProductDetailDialog
        product={selected && toProduct(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        {selected && (
          <BranchStockBreakdown key={selected.pId} pId={selected.pId} />
        )}
      </InventoryProductDetailDialog>
    </main>
  );
}
