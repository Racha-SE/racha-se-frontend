import { useState } from "react";
import { BarChart3 } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/auth-client";
import { DailySalesReport } from "./daily-sales-report";
import { InventoryReport } from "./inventory-report";

type ReportTab = "daily-sales" | "inventory";

export function BranchReportsPage() {
  const { data: session } = useSession();
  const branchId = session?.user.branchId;
  const [tab, setTab] = useState<ReportTab>("daily-sales");

  if (session && branchId == null) {
    return (
      <p className="p-6 text-sm text-muted-foreground">
        Your account isn&apos;t assigned to a branch.
      </p>
    );
  }

  return (
    <main className="min-h-screen bg-background p-6 text-left text-foreground">
      <header className="flex h-12 items-center gap-3 rounded-md bg-textbox px-3">
        <BarChart3 className="size-4.5 text-sidebar-top" aria-hidden="true" />
        <h1 className="m-0 text-xl font-semibold tracking-normal text-active">
          Branch Reports
        </h1>
      </header>

      <section className="mt-4 px-2">
        <Tabs
          value={tab}
          onValueChange={(value) =>
            setTab((value as ReportTab) ?? "daily-sales")
          }
        >
          <TabsList>
            <TabsTrigger value="daily-sales">Daily Sales</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>

          <TabsContent value="daily-sales" className="pt-3">
            <DailySalesReport />
          </TabsContent>

          <TabsContent value="inventory" className="pt-3">
            {branchId != null && <InventoryReport branchId={branchId} />}
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
}
