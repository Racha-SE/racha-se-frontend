import { useEffect, useState } from "react";

import {
  getProductStockByBranch,
  type ProductBranchStock,
} from "@/api/inventory";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BranchStockBreakdownProps {
  pId: number;
}

export function BranchStockBreakdown({ pId }: BranchStockBreakdownProps) {
  const [branches, setBranches] = useState<ProductBranchStock[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getProductStockByBranch(pId)
      .then((response) => {
        if (!cancelled) setBranches(response.data.branches);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [pId]);

  return (
    <div>
      <p className="mb-1 text-sm text-active">Stock by branch</p>
      {error ? (
        <p className="text-sm text-destructive">
          Couldn't load branch stock. Please try again.
        </p>
      ) : branches === null ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : branches.length === 0 ? (
        <p className="text-sm text-muted-foreground">No stock in any branch.</p>
      ) : (
        <div className="border border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="h-auto border-r border-border px-4 py-2 font-semibold">
                  Branch
                </TableHead>
                <TableHead className="h-auto px-4 py-2 font-semibold">
                  Quantity
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((branch) => (
                <TableRow
                  key={branch.branchId}
                  className="border-border even:bg-textbox"
                >
                  <TableCell className="h-auto border-r border-border px-4 py-2">
                    {branch.branchName}
                  </TableCell>
                  <TableCell className="h-auto px-4 py-2">
                    {branch.quantity}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
