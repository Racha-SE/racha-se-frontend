import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { ApiError } from "@/api/client";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { branchFormSchema, type BranchFormValues } from "./branch-form-schema";

interface BranchFormProps {
  /** Shown read-only at the top when editing an existing branch. */
  branchId?: number;
  initialValues?: Partial<BranchFormValues>;
  submitLabel: string;
  onSubmit: (values: BranchFormValues) => Promise<void>;
  onCancel: () => void;
}

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
] as const;

const inputClassName = "h-9 rounded-md bg-surface px-3 text-[13px]";

function RequiredLabel({ htmlFor, label }: { htmlFor: string; label: string }) {
  return (
    <FieldLabel htmlFor={htmlFor} className="text-xs font-medium">
      {label} <span className="text-destructive">*</span>
    </FieldLabel>
  );
}

export function BranchForm({
  branchId,
  initialValues = {},
  submitLabel,
  onSubmit,
  onCancel,
}: BranchFormProps) {
  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
      name: initialValues.name ?? "",
      address: initialValues.address ?? "",
      phoneNumber: initialValues.phoneNumber ?? "",
      status: initialValues.status ?? "active",
    },
  });

  async function handleSubmit(values: BranchFormValues) {
    try {
      await onSubmit(values);
    } catch (error) {
      // Branch names are unique, so a 409 is always about the name.
      if (error instanceof ApiError && error.status === 409) {
        form.setError("name", {
          message: "A branch with this name already exists.",
        });
        form.setError("root", {
          message:
            "A branch with this name already exists. Use a different name.",
        });
        return;
      }

      console.error("Failed to save branch:", error);
      form.setError("root", {
        message: "Couldn't save the branch. Please try again.",
      });
    }
  }

  const { errors } = form.formState;
  const hasFieldErrors = Boolean(
    errors.name || errors.address || errors.phoneNumber,
  );
  const errorBanner =
    errors.root?.message ??
    (hasFieldErrors
      ? "Couldn't save the changes. Please fix the highlighted fields."
      : undefined);

  return (
    <form
      className="w-full max-w-[640px] rounded-xl border border-border px-6 pt-[38px] pb-6"
      noValidate
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <FieldGroup className="gap-4">
        {errorBanner && (
          <p
            role="alert"
            className="m-0 rounded-md border border-destructive-background bg-destructive-subtle px-3.5 py-2.5 text-xs text-destructive-active"
          >
            {errorBanner}
          </p>
        )}

        {branchId !== undefined && (
          <Field className="gap-1.5">
            <FieldLabel htmlFor="branch-id" className="text-xs font-medium">
              Branch ID
            </FieldLabel>
            <Input
              id="branch-id"
              value={branchId}
              readOnly
              disabled
              className={`${inputClassName} bg-textbox text-searchbar`}
            />
          </Field>
        )}

        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <RequiredLabel htmlFor="branch-name" label="Branch name" />
              <Input
                {...field}
                id="branch-name"
                placeholder="e.g. Trang Central"
                className={inputClassName}
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="address"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <RequiredLabel htmlFor="branch-address" label="Address" />
              <textarea
                {...field}
                id="branch-address"
                placeholder="Street, district, province, postal code"
                className="h-[76px] w-full resize-none overflow-y-auto rounded-md border border-input bg-surface px-3 py-2 text-[13px] transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="phoneNumber"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <RequiredLabel htmlFor="branch-phone" label="Phone number" />
                <Input
                  {...field}
                  id="branch-phone"
                  type="tel"
                  placeholder="e.g. 075-123-456"
                  className={inputClassName}
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            name="status"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor="branch-status"
                  className="text-xs font-medium"
                >
                  Status
                </FieldLabel>
                <Select
                  items={statusOptions}
                  value={field.value}
                  onValueChange={(value) => field.onChange(value ?? "active")}
                >
                  <SelectTrigger
                    id="branch-status"
                    className="h-9! w-full rounded-md bg-surface px-3 text-[13px]"
                    onBlur={field.onBlur}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="start" alignItemWithTrigger={false}>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
        </div>

        <div className="flex justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            className="h-auto px-[18px] py-[9px] text-xs"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-auto px-[18px] py-[9px] text-xs"
            disabled={form.formState.isSubmitting}
          >
            {submitLabel}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
