import { Eye, FileCog2, FileX } from "lucide-react";

import type { Branch } from "@/api/branch";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { StatusBadge } from "./branch-details";

interface BranchTableProps {
  branches: Branch[];
  onView: (branchId: number) => void;
  onEdit: (branchId: number) => void;
  onDeactivate: (branch: Branch) => void;
}

export function BranchTable({
  branches,
  onView,
  onEdit,
  onDeactivate,
}: BranchTableProps) {
  return (
    <div className="max-w-[828px] border border-border">
      <Table>
        <TableHeader>
          <TableRow className="font-bold hover:bg-transparent">
            <TableHead className="w-[180px] border-r border-border">
              Branch ID
            </TableHead>
            <TableHead className="border-r border-border">
              Branch Name
            </TableHead>
            <TableHead className="w-[146px] border-r border-border">
              Status
            </TableHead>
            <TableHead className="w-[160px]">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {branches.map((branch) => (
            <TableRow
              key={branch.branchId}
              className="even:bg-textbox hover:bg-primary-subtle"
            >
              <TableCell className="border-r border-border">
                {branch.branchId}
              </TableCell>
              <TableCell className="border-r border-border">
                {branch.name}
              </TableCell>
              <TableCell className="border-r border-border">
                <StatusBadge isActive={branch.isActive} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`View ${branch.name}`}
                    onClick={() => onView(branch.branchId)}
                  >
                    <Eye />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Edit ${branch.name}`}
                    onClick={() => onEdit(branch.branchId)}
                  >
                    <FileCog2 />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="hover:bg-destructive-subtle hover:text-destructive"
                    aria-label={`Deactivate ${branch.name}`}
                    // Already-inactive branches have nothing to deactivate.
                    disabled={!branch.isActive}
                    onClick={() => onDeactivate(branch)}
                  >
                    <FileX />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}

          {branches.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No branches found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
