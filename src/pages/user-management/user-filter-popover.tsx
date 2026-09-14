import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SlidersHorizontal } from "lucide-react";

export type SortDirection = "asc" | "desc";

export type UserFilterValues = {
  id?: SortDirection;
  username?: SortDirection;
  email?: SortDirection;

  role?: "root" | "hq" | "branch" | "cashier";

  branch?: SortDirection;

  status?: "active" | "inactive";
};

interface UserFilterPopoverProps {
  value: UserFilterValues;

  onChange: (filters: UserFilterValues) => void;
}

const sortOptions = [
  {
    label: "Ascending",
    value: "asc",
  },
  {
    label: "Descending",
    value: "desc",
  },
] as const;

const roleOptions = [
  {
    label: "Root",
    value: "root",
  },
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

const statusOptions = [
  {
    label: "Active",
    value: "active",
  },
  {
    label: "Inactive",
    value: "inactive",
  },
] as const;

export function UserFilterPopover({ value, onChange }: UserFilterPopoverProps) {
  function toggleSort(field: "id" | "username" | "email" | "branch") {
    onChange({
      ...value,
      [field]: value[field] === undefined ? "asc" : undefined,
    });
  }

  function toggleRole() {
    onChange({
      ...value,

      role: value.role === undefined ? "hq" : undefined,
    });
  }

  function toggleStatus() {
    onChange({
      ...value,

      status: value.status === undefined ? "active" : undefined,
    });
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            size="sm"
            className="h-8 bg-primary text-primary-foreground hover:bg-active"
          >
            <SlidersHorizontal />
            Filter
          </Button>
        }
      />

      <PopoverContent
        align="end"
        className="w-[570px] rounded-xl bg-currency-card p-3"
      >
        <div className="mb-5 rounded-xl bg-surface px-4 py-5">
          <h2 className="text-xl font-semibold text-active">Filter</h2>
        </div>

        <div className="grid grid-cols-3 gap-x-4 gap-y-6">
          <SortFilter
            label="User ID"
            enabled={value.id !== undefined}
            value={value.id}
            onToggle={() => toggleSort("id")}
            onChange={(direction) => onChange({ ...value, id: direction })}
          />

          <SortFilter
            label="Username"
            enabled={value.username !== undefined}
            value={value.username}
            onToggle={() => toggleSort("username")}
            onChange={(direction) =>
              onChange({ ...value, username: direction })
            }
          />

          <SortFilter
            label="Gmail"
            enabled={value.email !== undefined}
            value={value.email}
            onToggle={() => toggleSort("email")}
            onChange={(direction) => onChange({ ...value, email: direction })}
          />

          <SelectFilter
            label="Role"
            enabled={value.role !== undefined}
            value={value.role}
            options={roleOptions}
            onToggle={toggleRole}
            onChange={(role) =>
              onChange({ ...value, role: role as UserFilterValues["role"] })
            }
          />

          <SortFilter
            label="Branch"
            enabled={value.branch !== undefined}
            value={value.branch}
            onToggle={() => toggleSort("branch")}
            onChange={(direction) => onChange({ ...value, branch: direction })}
          />

          <SelectFilter
            label="Status"
            enabled={value.status !== undefined}
            value={value.status}
            options={statusOptions}
            onToggle={toggleStatus}
            onChange={(status) =>
              onChange({
                ...value,
                status: status as UserFilterValues["status"],
              })
            }
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SortFilter({
  label,
  enabled,
  value,
  onToggle,
  onChange,
}: {
  label: string;
  enabled: boolean;
  value?: SortDirection;
  onToggle: () => void;

  onChange: (value: SortDirection) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Switch checked={enabled} onCheckedChange={onToggle} />

        <span className="text-sm">{label}</span>
      </div>

      {enabled && (
        <Select
          items={sortOptions}
          value={value}
          onValueChange={(nextValue) => {
            if (nextValue === "asc" || nextValue === "desc") {
              onChange(nextValue);
            }
          }}
        >
          <SelectTrigger className="h-9! w-full bg-surface">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>

          <SelectContent align="start" alignItemWithTrigger={false}>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

function SelectFilter({
  label,
  enabled,
  value,
  options,
  onToggle,
  onChange,
}: {
  label: string;
  enabled: boolean;
  value?: string;

  options: readonly {
    label: string;
    value: string;
  }[];

  onToggle: () => void;

  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Switch checked={enabled} onCheckedChange={onToggle} />

        <span className="text-sm">{label}</span>
      </div>

      {enabled && (
        <Select
          items={[...options]}
          value={value}
          onValueChange={(nextValue) => {
            if (nextValue) {
              onChange(nextValue);
            }
          }}
        >
          <SelectTrigger className="h-9! w-full bg-surface">
            <SelectValue placeholder="Select" />
          </SelectTrigger>

          <SelectContent align="start" alignItemWithTrigger={false}>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
