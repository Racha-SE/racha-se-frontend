import { useEffect, useState, type ReactNode } from "react";
import { Boxes } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getBranchById, type Branch } from "@/api/branch";
import { ApiError } from "@/api/client";
import { Button } from "@/components/ui/button";

import { DetailRow, StatusBadge } from "./branch-details";
import { formatBranchDate } from "./branch-format";

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

export function BranchDetailPage() {
  const navigate = useNavigate();
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate(`/hq/branches/${branch.branchId}/edit`)}
              >
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
                  {formatBranchDate(branch.createdAt)}
                </DetailRow>
                <DetailRow label="Last updated">
                  {formatBranchDate(branch.updatedAt)}
                </DetailRow>
              </DetailCard>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
