import { Eye, UserRoundCheck, UserRoundCog, UserRoundX } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { User } from "@/api/user";

interface UserTableProps {
  users: User[];

  branchNames: Record<number, string>;

  onView: (id: string) => void;

  onToggleStatus: (user: User) => void;
}

function getRoleLabel(user: User) {
  if (user.role === "admin") {
    return "Root";
  }

  switch (user.userType) {
    case "hq":
      return "Headquarter";

    case "branch":
      return "Branch Manager";

    case "cashier":
      return "Cashier";

    case "customer":
      return "Customer";
  }
}

export function UserTable({
  users,
  branchNames,
  onView,
  onToggleStatus,
}: UserTableProps) {
  return (
    <div className="border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="border-r border-border">User ID</TableHead>

            <TableHead className="border-r border-border">Username</TableHead>

            <TableHead className="border-r border-border">Gmail</TableHead>

            <TableHead className="border-r border-border">Role</TableHead>

            <TableHead className="border-r border-border">Branch</TableHead>

            <TableHead className="border-r border-border">Status</TableHead>

            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.id}
              className="even:bg-textbox hover:bg-primary-subtle"
            >
              <TableCell className="border-r border-border">
                {user.id}
              </TableCell>

              <TableCell className="border-r border-border">
                {user.username}
              </TableCell>

              <TableCell className="border-r border-border">
                {user.email}
              </TableCell>

              <TableCell className="border-r border-border">
                {getRoleLabel(user)}
              </TableCell>

              <TableCell className="border-r border-border">
                {user.branchId === null
                  ? "-"
                  : (branchNames[user.branchId] ?? String(user.branchId))}
              </TableCell>

              <TableCell className="border-r border-border">
                {user.banned ? "Inactive" : "Active"}
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`View ${user.username}`}
                    onClick={() => onView(user.id)}
                  >
                    <Eye />
                  </Button>

                  {user.role === "admin" ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      disabled
                    >
                      <UserRoundCog className="text-primary" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label={
                        user.banned
                          ? `Reactivate ${user.username}`
                          : `Deactivate ${user.username}`
                      }
                      onClick={() => onToggleStatus(user)}
                    >
                      {user.banned ? (
                        <UserRoundCheck className="text-sidebar-top" />
                      ) : (
                        <UserRoundX className="text-base-red-bright" />
                      )}
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}

          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
