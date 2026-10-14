import { useEffect, useMemo, useState } from "react";
import { Boxes } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getBranches, type Branch } from "@/api/branch";
import { PaginationControls } from "@/components/pagination-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { BranchTable } from "./branch-table";
import { DeactivateBranchDialog } from "./deactivate-branch-dialog";

const PAGE_SIZE = 10;

type StatusFilter = "all" | "active" | "inactive";

const statusOptions: Array<{ label: string; value: StatusFilter }> = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export function BranchListPage() {
  const navigate = useNavigate();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState("");
  // The select only stages a status; the Filter button applies it.
  const [pendingStatus, setPendingStatus] = useState<StatusFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [branchToDeactivate, setBranchToDeactivate] = useState<Branch | null>(
    null,
  );

  useEffect(() => {
    async function loadBranches() {
      try {
        const response = await getBranches();
        setBranches(response.data.result);
      } catch (error) {
        console.error("Failed to load branches:", error);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    }

    void loadBranches();
  }, []);

  // GET /branches has no search or paging, so both happen here.
  const filteredBranches = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return branches
      .filter(
        (branch) =>
          status === "all" || branch.isActive === (status === "active"),
      )
      .filter(
        (branch) =>
          !searchText ||
          String(branch.branchId).includes(searchText) ||
          branch.name.toLowerCase().includes(searchText),
      )
      .sort((a, b) => a.branchId - b.branchId);
  }, [branches, search, status]);

  const totalPages = Math.max(
    Math.ceil(filteredBranches.length / PAGE_SIZE),
    1,
  );
  const currentPage = Math.min(page, totalPages);
  const pageBranches = filteredBranches.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <main className="min-h-screen bg-background p-6 text-left text-foreground">
      <header className="flex h-12 items-center gap-3 rounded-md bg-textbox px-3">
        <Boxes className="size-4.5 text-sidebar-top" aria-hidden="true" />
        <h1 className="m-0 text-xl font-semibold tracking-normal text-active">
          Branch Management
        </h1>
      </header>

      <section className="mt-4 space-y-4 px-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="m-0 text-xl font-semibold text-active">Branches</h2>
          <Button
            type="button"
            size="sm"
            className="h-8 bg-primary text-sm text-primary-foreground hover:bg-active"
            onClick={() => navigate("/hq/branches/new")}
          >
            + Create new Branch
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Input
            className="h-8 max-w-[330px] rounded-sm border-border bg-searchbar px-3 text-primary-foreground placeholder:text-primary-foreground/70 focus-visible:border-focus focus-visible:ring-focus/20"
            value={search}
            placeholder="Search branch name or ID"
            aria-label="Search branches"
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />

          <Select
            items={statusOptions}
            value={pendingStatus}
            onValueChange={(nextValue) => setPendingStatus(nextValue ?? "all")}
          >
            <SelectTrigger
              className="h-8! w-[204px] rounded-sm bg-surface px-3 text-sm"
              aria-label="Filter by status"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            size="sm"
            className="h-8 w-[100px] bg-primary text-sm text-primary-foreground hover:bg-active"
            onClick={() => {
              setStatus(pendingStatus);
              setPage(1);
            }}
          >
            Filter
          </Button>
        </div>

        {loading ? (
          <div className="py-10 text-center">Loading...</div>
        ) : loadError ? (
          <div className="py-10 text-center text-destructive">
            Couldn&apos;t load branches. Please try again.
          </div>
        ) : (
          <BranchTable
            branches={pageBranches}
            onView={(branchId) => navigate(`/hq/branches/${branchId}`)}
            onEdit={(branchId) => navigate(`/hq/branches/${branchId}/edit`)}
            onDeactivate={setBranchToDeactivate}
          />
        )}

        <div className="flex max-w-[828px] items-center justify-between text-sm">
          <span>Showing {filteredBranches.length} branches</span>
          <PaginationControls
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </section>

      <DeactivateBranchDialog
        branch={branchToDeactivate}
        onOpenChange={(open) => {
          if (!open) setBranchToDeactivate(null);
        }}
        onDeactivated={(updated) =>
          setBranches((current) =>
            current.map((branch) =>
              branch.branchId === updated.branchId ? updated : branch,
            ),
          )
        }
      />
    </main>
  );
}
