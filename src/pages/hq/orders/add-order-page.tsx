import { useEffect, useState } from "react";
import { PackagePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { createHqOrder, getOrderSuppliers } from "@/api/orders";

import { OrderForm } from "./order-form";
import type { OrderFormValues } from "./order-form-schema";

export function AddOrderPage() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSuppliers() {
      try {
        const response = await getOrderSuppliers();
        if (cancelled) return;

        setSuppliers(
          response.data.result.map((supplier) => ({
            label: supplier.name,
            value: String(supplier.supplierId),
          })),
        );
      } catch {
        if (!cancelled) setError("Couldn't load suppliers. Please try again.");
      } finally {
        if (!cancelled) setIsLoadingSuppliers(false);
      }
    }

    loadSuppliers();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(values: OrderFormValues) {
    setError(null);

    try {
      await createHqOrder({
        items: values.items.map((item) => ({
          ...item,
          expiredDate: `${item.expiryDate}T23:59:59.999Z`,
        })),
      });
      navigate("/hq/inventory");
    } catch {
      setError(
        "Couldn't create the order. Please check the form and try again.",
      );
    }
  }

  function handleCancel() {
    navigate("/hq/inventory");
  }

  return (
    <main className="min-h-screen bg-background p-4">
      <header className="flex h-12 items-center gap-2.5 rounded-md bg-textbox px-4">
        <PackagePlus className="size-5 text-foreground" aria-hidden="true" />
        <h1 className="m-0 text-lg font-semibold tracking-normal text-active">
          Add Order
        </h1>
      </header>

      <section className="mt-4 px-3">
        {isLoadingSuppliers ? (
          <p className="py-6 text-sm text-muted-foreground">
            Loading suppliers...
          </p>
        ) : (
          <>
            {error && (
              <p className="mb-4 text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <OrderForm
              suppliers={suppliers}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </>
        )}
      </section>
    </main>
  );
}
