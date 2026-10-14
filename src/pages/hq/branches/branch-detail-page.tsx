import { useEffect, useState, type ReactNode } from "react";
import { Boxes } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { getBranchById, type Branch } from "@/api/branch";
import { ApiError } from "@/api/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatDate(value: string) {
  // en-CA formats as YYYY-MM-DD, matching the design.
  return new Date(value).toLocaleDateString("en-CA");
}

function StatusBadge({
  isActive,
  className,
}: {
  isActive: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "w-fit rounded-full px-2.5 py-0.5 text-xs font-medium",
        isActive
          ? "bg-[#e6f6ec] text-[#1f7a3f]"
          : "bg-destructive-subtle text-destructive-active",
        className,
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function DetailCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-1 flex-col gap-3 rounded-xl border border-border px-[18px] py-4">
      <h3 className="m-0 text-[15px] font-semibold text-active">{title}</h3>
      <dl className="m-0 grid grid-cols-[120px_minmax(0,1fr)] gap-x-3 gap-y-2.5 text-[13px]">
        {children}
      </dl>
    </section>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <>
      <dt className="text-searchbar">{label}</dt>
      <dd className="m-0 whitespace-pre-line text-foreground">{children}</dd>
    </>
  );
}

export function BranchDetailPage() {
  const { branchId } = useParams();

  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadBranch() {
      const id = Number(branchId);

      if (!Number.isInteger(id)) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const response = await getBranchById(id);
        setBranch(response.data.result);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          setNotFound(true);
        } else {
          console.error("Failed to load branch:", error);
        }
      } finally {
        setLoading(false);
      }
    }

    void loadBranch();
  }, [branchId]);

  return (
    <main className="min-h-screen bg-background p-6 text-left text-foreground">
      <header className="flex h-12 items-center gap-3 rounded-md bg-textbox px-3">
        <Boxes className="size-4.5 text-sidebar-top" aria-hidden="true" />
        <h1 className="m-0 text-xl font-semibold tracking-normal text-active">
          Branch Management
        </h1>
      </header>

      <section className="mt-4 flex flex-col gap-3.5 px-3.5">
        <Link
          to="/hq/branches"
          className="w-fit text-[13px] text-primary hover:underline"
        >
          ← Back to branches
        </Link>

        {loading ? (
          <div className="py-10 text-center">Loading...</div>
        ) : !branch ? (
          <div className="py-10 text-center">
            {notFound
              ? "Branch not found."
              : "Couldn't load this branch. Please try again."}
          </div>
        ) : (
          <>
            <div className="flex max-w-[900px] items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="m-0 text-xl font-semibold text-active">
                  {branch.name}
                </h2>
                <StatusBadge isActive={branch.isActive} />
              </div>
              {/* Wired up by the Branch Update (#8) task. */}
              <Button type="button" variant="outline" size="sm" disabled>
                Edit branch
              </Button>
            </div>

            <div className="flex max-w-[900px] items-start gap-4 pt-1">
              <DetailCard title="Branch information">
                <DetailRow label="Branch ID">{branch.branchId}</DetailRow>
                <DetailRow label="Branch name">{branch.name}</DetailRow>
                <DetailRow label="Status">
                  <StatusBadge isActive={branch.isActive} />
                </DetailRow>
              </DetailCard>

              <DetailCard title="Contact">
                <DetailRow label="Address">{branch.address}</DetailRow>
                <DetailRow label="Phone number">{branch.phoneNumber}</DetailRow>
              </DetailCard>

              <DetailCard title="Record">
                <DetailRow label="Created">
                  {formatDate(branch.createdAt)}
                </DetailRow>
                <DetailRow label="Last updated">
                  {formatDate(branch.updatedAt)}
                </DetailRow>
              </DetailCard>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
