import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

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

import type { Branch } from "@/api/branch";

import {
  userFormSchema,
  type UserFormInput,
  type UserFormValues,
} from "./user-form-schema";

interface UserFormProps {
  branches: Branch[];

  // A branch actor can create more branch managers and cashiers, but only
  // for their own branch (MANAGEABLE_USER_TYPES in the backend's
  // hierarchy.ts) — narrows the role choices to those two and locks the
  // branch field instead of offering every branch in the system. Only "hq"
  // and "branch" ever reach this page at all (RequireRoot gates on
  // role === "admin"), so this is effectively "am I HQ or a branch root".
  allowedRoles?: readonly (typeof roleOptions)[number]["value"][];
  lockedBranchId?: number;

  onSubmit: (values: UserFormValues) => void | Promise<void>;

  onCancel: () => void;
}

const roleOptions = [
  {
    label: "Headquarter",
    value: "hq",
  },
  {
    label: "Branch Manager",
    value: "branch",
  },
  {
    label: "Cashier",
    value: "cashier",
  },
] as const;

function generatePassword() {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";

  let password = "";

  for (let index = 0; index < 12; index++) {
    password += characters[Math.floor(Math.random() * characters.length)];
  }

  return password;
}

export function UserForm({
  branches,
  allowedRoles,
  lockedBranchId,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const visibleRoleOptions = allowedRoles
    ? roleOptions.filter((role) => allowedRoles.includes(role.value))
    : roleOptions;

  const form = useForm<UserFormInput, unknown, UserFormValues>({
    resolver: zodResolver(userFormSchema),

    defaultValues: {
      firstname: "",
      lastname: "",
      username: "",
      email: "",
      password: "",
      role: visibleRoleOptions[0]?.value ?? "hq",
      branchId: lockedBranchId ? String(lockedBranchId) : "",
    },
  });

  const selectedRole = form.watch("role");

  const lockedBranchName = branches.find(
    (branch) => branch.branchId === lockedBranchId,
  )?.name;

  const branchOptions = branches
    .filter((branch) => branch.isActive)
    .map((branch) => ({
      label: branch.name,
      value: String(branch.branchId),
    }));

  function handleGeneratePassword() {
    form.setValue("password", generatePassword(), {
      shouldValidate: true,
    });
  }

  return (
    <form
      className="w-full max-w-[520px] text-sm"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <Controller
          name="firstname"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-1" data-invalid={fieldState.invalid}>
              <FieldLabel
                htmlFor="firstname"
                className="text-sm font-normal text-active"
              >
                First Name *
              </FieldLabel>

              <Input
                {...field}
                id="firstname"
                className="h-9 max-w-[280px] bg-textbox"
                aria-invalid={fieldState.invalid}
              />

              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="lastname"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-1" data-invalid={fieldState.invalid}>
              <FieldLabel
                htmlFor="lastname"
                className="text-sm font-normal text-active"
              >
                Last Name *
              </FieldLabel>

              <Input
                {...field}
                id="lastname"
                className="h-9 max-w-[280px] bg-textbox"
                aria-invalid={fieldState.invalid}
              />

              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-1" data-invalid={fieldState.invalid}>
              <FieldLabel
                htmlFor="username"
                className="text-sm font-normal text-active"
              >
                Username *
              </FieldLabel>

              <Input
                {...field}
                id="username"
                className="h-9 max-w-[280px] bg-textbox"
                aria-invalid={fieldState.invalid}
              />

              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-1" data-invalid={fieldState.invalid}>
              <FieldLabel
                htmlFor="email"
                className="text-sm font-normal text-active"
              >
                Gmail *
              </FieldLabel>

              <Input
                {...field}
                id="email"
                type="email"
                className="h-9 max-w-[280px] bg-textbox"
                aria-invalid={fieldState.invalid}
              />

              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-1" data-invalid={fieldState.invalid}>
              <FieldLabel
                htmlFor="password"
                className="text-sm font-normal text-active"
              >
                Password *
              </FieldLabel>

              <div className="flex items-center gap-4">
                <Input
                  {...field}
                  id="password"
                  type="text"
                  className="h-9 max-w-[280px] bg-textbox"
                  aria-invalid={fieldState.invalid}
                />

                <Button
                  type="button"
                  className="h-9"
                  onClick={handleGeneratePassword}
                >
                  Generate Password
                </Button>
              </div>

              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="role"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-1" data-invalid={fieldState.invalid}>
              <FieldLabel
                htmlFor="role"
                className="text-sm font-normal text-active"
              >
                Role *
              </FieldLabel>

              <Select
                items={visibleRoleOptions}
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value ?? "");

                  if (value === "hq") {
                    form.setValue("branchId", "");
                  } else if (lockedBranchId) {
                    form.setValue("branchId", String(lockedBranchId));
                  }
                }}
              >
                <SelectTrigger
                  id="role"
                  className="h-9! w-[180px]"
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>

                <SelectContent align="start" alignItemWithTrigger={false}>
                  {visibleRoleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        {selectedRole !== "hq" && (
          <Controller
            name="branchId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="gap-1" data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor="branch"
                  className="text-sm font-normal text-active"
                >
                  Branch selection *
                </FieldLabel>

                {lockedBranchId ? (
                  <p className="flex h-9 w-[220px] items-center text-sm text-muted-foreground">
                    {lockedBranchName ?? `Branch #${lockedBranchId}`}
                  </p>
                ) : (
                  <Select
                    items={branchOptions}
                    value={field.value || null}
                    onValueChange={(value) => field.onChange(value ?? "")}
                  >
                    <SelectTrigger
                      id="branch"
                      className="h-9! w-[220px]"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>

                    <SelectContent align="start" alignItemWithTrigger={false}>
                      {branchOptions.map((branch) => (
                        <SelectItem key={branch.value} value={branch.value}>
                          {branch.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Save
          </Button>

          <Button
            type="button"
            className="bg-destructive-active text-primary-foreground hover:bg-destructive"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
