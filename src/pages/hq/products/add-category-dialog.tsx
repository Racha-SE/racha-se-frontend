import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCategoryDialog({
  open,
  onOpenChange,
}: AddCategoryDialogProps) {
  const [name, setName] = useState("");

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setName("");
    }

    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent overlayClassName="bg-black/30">
        <DialogTitle>Add New Category</DialogTitle>

        <div className="space-y-2">
          <Label htmlFor="new-category-name">Category name</Label>
          <Input
            id="new-category-name"
            value={name}
            autoFocus
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!name.trim()}
            onClick={() => handleOpenChange(false)}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
