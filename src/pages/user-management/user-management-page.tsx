import { useEffect, useMemo, useState } from "react";
import { UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/pagination-controls";
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

const itemsPerPage = 10;

export function UserManagementPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);

  const [branches, setBranches] = useState<Branch[]>([]);

  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState<UserFilterValues>({});

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

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
        // "root" is better-auth's role column, not a userType value — kept
        // as its own param (isRoot) rather than overloading userType with
        // something that isn't one of its enum members. See api/user.ts.
        const response = await getUsers({
          search: search.trim() || undefined,
          userType:
            filters.role && filters.role !== "root" ? filters.role : undefined,
          isRoot: filters.role === "root" ? true : undefined,
          status: filters.status,
          sortId: filters.id,
          sortUsername: filters.username,
          sortEmail: filters.email,
          sortBranch: filters.branch,
          limit: itemsPerPage,
          offset: (page - 1) * itemsPerPage,
        });

        setUsers(response.data.users);
        setTotal(response.data.total);
        setTotalPages(Math.max(response.data.totalPages, 1));
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setLoading(false);
      }
    }

    void loadUsers();
  }, [search, filters, page]);

  const branchNames = useMemo(() => {
    return Object.fromEntries(
      branches.map((branch) => [branch.branchId, branch.name]),
    ) as Record<number, string>;
  }, [branches]);

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

        <h1 className="m-0 text-xl font-semibold tracking-normal text-active">
          User Management
        </h1>
      </header>

      <section className="mt-4 space-y-4 px-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Input
            className="h-8 max-w-[280px] rounded-sm border-border bg-searchbar px-3 text-primary-foreground placeholder:text-primary-foreground/70 focus-visible:border-focus focus-visible:ring-focus/20"
            value={search}
            placeholder="Search Username"
            aria-label="Search username"
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
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

            <UserFilterPopover
              value={filters}
              onChange={(nextFilters) => {
                setFilters(nextFilters);
                setPage(1);
              }}
            />
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center">Loading...</div>
        ) : (
          <UserTable
            users={users}
            branchNames={branchNames}
            onView={(id) =>
              navigate(`/user-management/${encodeURIComponent(id)}`)
            }
            onToggleStatus={handleToggleStatus}
          />
        )}

        <div className="flex items-center justify-between text-sm text-foreground">
          <span>
            Showing {users.length} of {total} items
          </span>
          <PaginationControls
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </section>
    </main>
  );
}
