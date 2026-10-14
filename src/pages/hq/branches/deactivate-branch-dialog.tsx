import { useState } from "react";
import { TriangleAlert } from "lucide-react";

import { deactivateBranch, type Branch } from "@/api/branch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

import { DetailRow, StatusBadge } from "./branch-details";

interface DeactivateBranchDialogProps {
  /** The branch to confirm; `null` keeps the dialog closed. */
  branch: Branch | null;
  onOpenChange: (open: boolean) => void;
  onDeactivated: (branch: Branch) => void;
}

export function DeactivateBranchDialog({
  branch,
  onOpenChange,
  onDeactivated,
}: DeactivateBranchDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(open: boolean) {
    if (!open) setError(null);
    onOpenChange(open);
  }

  async function handleConfirm() {
    if (!branch) return;

    try {
      setIsSaving(true);
      setError(null);

      const response = await deactivateBranch(branch.branchId);
      onDeactivated(response.data.result);
      onOpenChange(false);
    } catch (deactivateError) {
      console.error("Failed to deactivate branch:", deactivateError);
      setError("Couldn't deactivate the branch. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={branch !== null} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-sidebar-top/40"
        className="gap-2 p-[30px] sm:max-w-[540px]"
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive-subtle">
          <TriangleAlert
            className="size-[26px] text-destructive"
            aria-hidden="true"
          />
        </div>

        <DialogTitle className="pt-2 text-2xl font-semibold">
          Deactivate this branch?
        </DialogTitle>
        <DialogDescription className="pb-3 text-base text-sidebar-bottom">
          This branch will be marked as Inactive.
        </DialogDescription>

        {branch && (
          <dl className="m-0 grid grid-cols-[140px_minmax(0,1fr)] gap-x-3 gap-y-2.5 rounded-[10px] border border-border bg-textbox px-[18px] py-4 text-[15px]">
            <DetailRow label="Branch ID">{branch.branchId}</DetailRow>
            <DetailRow label="Branch name">{branch.name}</DetailRow>
            <DetailRow label="Current status">
              <StatusBadge isActive={branch.isActive} />
            </DetailRow>
          </dl>
        )}

        {error && (
          <p role="alert" className="m-0 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-3.5">
          <Button
            type="button"
            variant="outline"
            className="h-auto px-5 py-[11px] text-sm"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-auto bg-destructive px-5 py-[11px] text-sm text-primary-foreground hover:bg-destructive-active"
            disabled={isSaving}
            onClick={() => void handleConfirm()}
          >
            Deactivate branch
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
