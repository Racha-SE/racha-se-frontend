import { useEffect, useState } from "react";
import { ClipboardPen } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  createBranchStockAdjustment,
  getAllBranchStock,
  getStockAdjustmentErrorMessage,
} from "@/api/inventory";
import { getProducts } from "@/api/product";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

import {
  StockAdjustmentForm,
  type AdjustableProduct,
} from "./stock-adjustment-form";
import type { StockAdjustmentFormValues } from "./stock-adjustment-form-schema";

type SavedAdjustment = {
  productName: string;
  quantityChange: number;
  onHand: number;
};

const productPageSize = 100;

async function getAllActiveProducts() {
  const firstPage = await getProducts({
    isActive: true,
    limit: productPageSize,
    offset: 0,
  });
  const { products, total } = firstPage.data;

  const offsets: number[] = [];
  for (
    let offset = productPageSize;
    offset < total;
    offset += productPageSize
  ) {
    offsets.push(offset);
  }

  const otherPages = await Promise.all(
    offsets.map((offset) =>
      getProducts({ isActive: true, limit: productPageSize, offset }),
    ),
  );

  return [...products, ...otherPages.flatMap((page) => page.data.products)];
}

async function loadAdjustableProducts(
  branchId: number,
  signal?: AbortSignal,
): Promise<AdjustableProduct[]> {
  const [products, stock] = await Promise.all([
    getAllActiveProducts(),
    getAllBranchStock(branchId, signal),
  ]);
  const onHandByPId = new Map(stock.map((item) => [item.pId, item.quantity]));

  return products.map((product) => ({
    pId: product.pId,
    productName: product.name,
    quantity: onHandByPId.get(product.pId) ?? 0,
  }));
}

export function StockAdjustmentPage() {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const branchId = session?.user.branchId ?? null;

  const [products, setProducts] = useState<AdjustableProduct[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedAdjustment | null>(null);
  // Bumped after a save so the form remounts empty for the next adjustment.
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (branchId == null) return;

    const controller = new AbortController();

    loadAdjustableProducts(branchId, controller.signal).then(
      (adjustable) => {
        if (controller.signal.aborted) return;
        setProducts(adjustable);
        setLoadError(null);
      },
      () => {
        if (controller.signal.aborted) return;
        setLoadError("Couldn't load branch stock. Please try again.");
      },
    );

    return () => controller.abort();
  }, [branchId]);

  async function handleSubmit(values: StockAdjustmentFormValues) {
    if (branchId == null) return;
    setSubmitError(null);
    setSaved(null);

    try {
      const response = await createBranchStockAdjustment(branchId, values);
      const productName =
        products?.find((item) => item.pId === values.pId)?.productName ??
        `Product #${values.pId}`;

      setSaved({
        productName,
        quantityChange: response.data.quantityChange,
        onHand: response.data.onHand,
      });
      setFormKey((key) => key + 1);
    } catch (error) {
      setSubmitError(getStockAdjustmentErrorMessage(error));
      return;
    }

    // The save already succeeded; refresh the on-hand counts the form
    // validates against. A failed refresh keeps the old list.
    try {
      setProducts(await loadAdjustableProducts(branchId));
    } catch {
      // keep the previous counts
    }
  }

  function handleCancel() {
    navigate("/branch/inventory");
  }

  return (
    <main className="min-h-screen bg-background p-4 text-left">
      <header className="flex h-12 items-center gap-2.5 rounded-md bg-textbox px-4">
        <ClipboardPen className="size-5 text-foreground" aria-hidden="true" />
        <h1 className="m-0 text-xl font-semibold tracking-normal text-active">
          Adjust Stock
        </h1>
      </header>

      <section className="mt-4 space-y-4 px-3">
        <p className="m-0 text-sm text-muted-foreground">
          Correct this branch's stock so it matches what's on the shelf. Use a
          minus to remove units (damaged, lost, miscounted) and a plus to add
          units found in a recount.
        </p>

        {branchId == null ? (
          <p className="py-6 text-sm text-muted-foreground">
            Your account isn't assigned to a branch.
          </p>
        ) : loadError ? (
          <p className="py-6 text-sm text-destructive" role="alert">
            {loadError}
          </p>
        ) : products === null ? (
          <p className="py-6 text-sm text-muted-foreground">
            Loading branch stock...
          </p>
        ) : products.length === 0 ? (
          <p className="py-6 text-sm text-muted-foreground">
            There are no active products to adjust.
          </p>
        ) : (
          <>
            {saved && (
              <div
                className="flex flex-wrap items-center gap-3 rounded-md border border-success/40 bg-success/10 px-4 py-3 text-sm text-sidebar-top"
                role="status"
              >
                <span>
                  Adjustment saved: {saved.productName}{" "}
                  {saved.quantityChange > 0 ? "+" : ""}
                  {saved.quantityChange}. Branch inventory now shows{" "}
                  {saved.onHand} on hand.
                </span>
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto rounded-[6px] px-3 py-1.5 text-sm"
                  onClick={() => navigate("/branch/inventory")}
                >
                  Go to branch inventory
                </Button>
              </div>
            )}

            {submitError && (
              <p className="text-sm text-destructive" role="alert">
                {submitError}
              </p>
            )}

            <StockAdjustmentForm
              key={formKey}
              products={products}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </>
        )}
      </section>
    </main>
  );
}
