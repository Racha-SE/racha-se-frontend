import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { requisitionError } from "./requisition-utils";

const rejectSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, "Please provide a rejection reason.")
    .max(255, "Rejection reason must not exceed 255 characters."),
});

type Props = {
  action: "approve" | "reject";
  lotId: number;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
};

export function RequisitionDecisionDialog({
  action,
  lotId,
  onClose,
  onConfirm,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);

  const form = useForm<z.infer<typeof rejectSchema>>({
    resolver: zodResolver(rejectSchema),
    defaultValues: {
      reason: "",
    },
    mode: "onChange",
  });

  const rejecting = action === "reject";

  async function submit(reason: string) {
    if (submitting.current) return;

    submitting.current = true;
    setBusy(true);
    setError("");

    try {
      await onConfirm(reason);
    } catch (failure) {
      setError(requisitionError(failure));
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !submitting.current) {
          onClose();
        }
      }}
    >
      <DialogContent showCloseButton={!busy} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {rejecting ? "Reject" : "Approve"} requisition #{lotId}?
          </DialogTitle>

          <DialogDescription>
            {rejecting
              ? "Provide a reason for the branch before rejecting this request."
              : "Confirm approval of the requested quantities. HQ stock will be deducted."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          noValidate
          onSubmit={(event) => {
            if (rejecting) {
              void form.handleSubmit(({ reason }) => submit(reason))(event);
            } else {
              event.preventDefault();
              void submit("");
            }
          }}
        >
          {rejecting && (
            <Field data-invalid={Boolean(form.formState.errors.reason)}>
              <FieldLabel htmlFor="rejection-reason">
                Rejection reason (required)
              </FieldLabel>

              <textarea
                id="rejection-reason"
                rows={4}
                required
                disabled={busy}
                aria-invalid={Boolean(form.formState.errors.reason)}
                aria-describedby={
                  form.formState.errors.reason ? "rejection-error" : undefined
                }
                className="w-full rounded-md border border-input bg-background p-3 text-sm focus-visible:outline-2 focus-visible:outline-ring"
                {...form.register("reason")}
              />

              <FieldError
                id="rejection-error"
                errors={[form.formState.errors.reason]}
              />
            </Field>
          )}

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className={
                rejecting
                  ? "bg-destructive-active text-primary-foreground hover:bg-destructive"
                  : undefined
              }
              disabled={busy || (rejecting && !form.formState.isValid)}
            >
              {busy
                ? "Saving..."
                : rejecting
                  ? "Confirm rejection"
                  : "Confirm approval"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
