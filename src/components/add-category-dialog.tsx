import { useState } from "react";

import { createCategory, type Category } from "@/api/category";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (category: Category) => void;
}

export function AddCategoryDialog({
  open,
  onOpenChange,
  onCreated,
}: AddCategoryDialogProps) {
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setName("");
    }

    onOpenChange(nextOpen);
  }

  async function handleSave() {
    const categoryName = name.trim();

    if (!categoryName) return;

    try {
      setIsSaving(true);

      const response = await createCategory({ categoryName });
      onCreated?.(response.data.result);

      setName("");
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
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
            disabled={!name.trim() || isSaving}
            onClick={() => void handleSave()}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
