import { useEffect, useMemo, useState } from "react";
import { UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBranches, type Branch } from "@/api/branch";
import {
  deactivateUser,
  getUsers,
  reactivateUser,
  type User,
} from "@/api/user";
import {
  UserFilterPopover,
  type UserFilterValues,
} from "./user-filter-popover";
import { UserTable } from "./user-table";

export function UserManagementPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);

  const [branches, setBranches] = useState<Branch[]>([]);

  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState<UserFilterValues>({});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBranches() {
      try {
        const response = await getBranches();

        setBranches(response.data.result);
      } catch (error) {
        console.error("Failed to load branches:", error);
      }
    }

    void loadBranches();
  }, []);

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);

      try {
        const response = await getUsers({
          search,
          limit: 1000,
          offset: 0,
        });

        setUsers(response.data.users);
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setLoading(false);
      }
    }

    void loadUsers();
  }, [search]);

  const branchNames = useMemo(() => {
    return Object.fromEntries(
      branches.map((branch) => [branch.branchId, branch.name]),
    ) as Record<number, string>;
  }, [branches]);

  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (filters.role) {
      result = result.filter((user) => {
        if (filters.role === "root") {
          return user.role === "admin";
        }

        return user.userType === filters.role;
      });
    }

    if (filters.status) {
      result = result.filter((user) =>
        filters.status === "active" ? !user.banned : Boolean(user.banned),
      );
    }

    const sorters = [
      ["id", filters.id],
      ["username", filters.username],
      ["email", filters.email],
      ["branch", filters.branch],
    ] as const;

    const enabledSorters = sorters.filter(
      ([, direction]) => direction !== undefined,
    );

    if (enabledSorters.length > 0) {
      result.sort((a, b) => {
        for (const [field, direction] of enabledSorters) {
          const valueA = getSortValue(a, field, branchNames);

          const valueB = getSortValue(b, field, branchNames);

          const comparison = valueA.localeCompare(valueB, undefined, {
            numeric: true,
            sensitivity: "base",
          });

          if (comparison !== 0) {
            return direction === "asc" ? comparison : -comparison;
          }
        }

        return 0;
      });
    }

    return result;
  }, [users, filters, branchNames]);

  async function handleToggleStatus(user: User) {
    try {
      const response = user.banned
        ? await reactivateUser(user.id)
        : await deactivateUser(user.id);

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === user.id ? response.data : currentUser,
        ),
      );
    } catch (error) {
      console.error("Failed to update user status:", error);
    }
  }

  return (
    <main className="min-h-screen bg-background p-6 text-left text-foreground">
      <header className="flex h-12 items-center gap-3 rounded-md bg-textbox px-3">
        <UsersRound className="size-4.5 text-sidebar-top" aria-hidden="true" />

        <h1 className="m-0 text-base font-semibold tracking-normal text-active">
          User Management
        </h1>
      </header>

      <section className="mt-4 space-y-4 px-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Input
            className="h-8 max-w-[280px] rounded-sm border-border bg-searchbar px-3 text-base text-primary-foreground placeholder:text-primary-foreground/70 focus-visible:border-focus focus-visible:ring-focus/20"
            value={search}
            placeholder="Search Username"
            aria-label="Search username"
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className="flex gap-3">
            <Button
              type="button"
              size="sm"
              className="h-8 bg-primary text-sm text-primary-foreground hover:bg-active focus-visible:ring-focus/30"
              onClick={() => navigate("/user-management/add")}
            >
              Add User
            </Button>

            <UserFilterPopover value={filters} onChange={setFilters} />
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center">Loading...</div>
        ) : (
          <UserTable
            users={filteredUsers}
            branchNames={branchNames}
            onView={(id) =>
              navigate(`/user-management/${encodeURIComponent(id)}`)
            }
            onToggleStatus={handleToggleStatus}
          />
        )}

        <div className="text-sm text-foreground">
          Showing {filteredUsers.length} items
        </div>
      </section>
    </main>
  );
}

function getSortValue(
  user: User,
  field: "id" | "username" | "email" | "branch",
  branchNames: Record<number, string>,
) {
  switch (field) {
    case "id":
      return user.id;

    case "username":
      return user.username;

    case "email":
      return user.email;

    case "branch":
      if (user.branchId === null) {
        return "";
      }

      return branchNames[user.branchId] ?? "";
  }
}
