import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Plus, Search } from "lucide-react";

import { getOrderProducts, type OrderProduct } from "@/api/orders";
import type { Product } from "@/api/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { CreateProductDialog } from "./create-product-dialog";

interface ProductSearchSelectProps {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  onBlur: () => void;
  "aria-invalid"?: boolean;
}

export function ProductSearchSelect({
  id,
  value,
  onValueChange,
  onBlur,
  "aria-invalid": ariaInvalid,
}: ProductSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<OrderProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<OrderProduct | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setIsLoading(true);
      setError(false);

      try {
        const response = await getOrderProducts(search);
        if (cancelled) return;

        setProducts(response.data.products);
        const current = response.data.products.find(
          (product) => String(product.pId) === value,
        );
        if (current) setSelectedProduct(current);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [open, search, value]);

  function handleCreateClick() {
    setOpen(false);
    setCreateOpen(true);
  }

  function handleProductCreated(product: Product) {
    setSelectedProduct({
      pId: product.pId,
      name: product.name,
      barcode: product.barcode,
    });
    onValueChange(String(product.pId));
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              className="h-9 w-full max-w-[280px] justify-between rounded-md px-3 py-2 font-normal"
              aria-invalid={ariaInvalid}
              onBlur={onBlur}
            >
              <span className="truncate">
                {selectedProduct
                  ? `#${selectedProduct.pId} — ${selectedProduct.name}`
                  : "Select a product"}
              </span>
              <ChevronsUpDown className="text-muted-foreground" />
            </Button>
          }
        />

        <PopoverContent align="start" className="w-[280px] gap-2 p-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={search}
              placeholder="Search product name or barcode"
              className="pl-8"
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="max-h-56 overflow-y-auto">
            {isLoading ? (
              <p className="p-3 text-center text-sm text-muted-foreground">
                Loading products...
              </p>
            ) : error ? (
              <p className="p-3 text-center text-sm text-destructive">
                Couldn't load products.
              </p>
            ) : products.length === 0 ? (
              <p className="p-3 text-center text-sm text-muted-foreground">
                No products found.
              </p>
            ) : (
              products.map((product) => {
                const selected = String(product.pId) === value;

                return (
                  <button
                    key={product.pId}
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => {
                      setSelectedProduct(product);
                      onValueChange(String(product.pId));
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={selected ? "size-4" : "size-4 opacity-0"}
                    />
                    <span className="min-w-0">
                      <span className="block truncate">{product.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        ID: {product.pId} · {product.barcode}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t border-border pt-2">
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-start px-2 font-normal text-active"
              onClick={handleCreateClick}
            >
              <Plus />
              Create new product
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <CreateProductDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        initialName={search}
        onCreated={handleProductCreated}
      />
    </>
  );
}
