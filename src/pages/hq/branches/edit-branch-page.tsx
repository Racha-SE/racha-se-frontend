import { useEffect, useState } from "react";
import { Boxes } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getBranchById, updateBranch, type Branch } from "@/api/branch";
import { ApiError } from "@/api/client";
import { Button } from "@/components/ui/button";

import { DetailRow, StatusBadge } from "./branch-details";
import { BranchForm } from "./branch-form";
import type { BranchFormValues } from "./branch-form-schema";
import { formatBranchDate } from "./branch-format";

function toFormValues(branch: Branch): BranchFormValues {
  return {
    name: branch.name,
    address: branch.address,
    phoneNumber: branch.phoneNumber,
    status: branch.isActive ? "active" : "inactive",
  };
}

function UpdateSuccess({
  branch,
  onKeepEditing,
  onBack,
}: {
  branch: Branch;
  onKeepEditing: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex w-full max-w-[640px] flex-col gap-3 rounded-xl border border-border px-6 pt-[38px] pb-6">
      <p
        role="status"
        className="m-0 rounded-md border border-[#b7e4c7] bg-[#e6f6ec] px-3.5 py-2.5 text-xs text-[#1f7a3f]"
      >
        Branch updated successfully.
      </p>

      <h3 className="m-0 pt-1 text-[15px] font-semibold text-active">
        Updated branch information
      </h3>

      <dl className="m-0 grid grid-cols-[130px_minmax(0,1fr)] gap-x-3 gap-y-2.5 text-[13px]">
        <DetailRow label="Branch ID">{branch.branchId}</DetailRow>
        <DetailRow label="Branch name">{branch.name}</DetailRow>
        <DetailRow label="Status">
          <StatusBadge isActive={branch.isActive} />
        </DetailRow>
        <DetailRow label="Address">{branch.address}</DetailRow>
        <DetailRow label="Phone number">{branch.phoneNumber}</DetailRow>
        <DetailRow label="Last updated">
          {formatBranchDate(branch.updatedAt)}
        </DetailRow>
      </dl>

      <div className="flex justify-end gap-2.5 pt-2">
        <Button
          type="button"
          variant="outline"
          className="h-auto px-[18px] py-[9px] text-xs"
          onClick={onKeepEditing}
        >
          Keep editing
        </Button>
        <Button
          type="button"
          className="h-auto px-[18px] py-[9px] text-xs"
          onClick={onBack}
        >
          Back to branch details
        </Button>
      </div>
    </div>
  );
}

export function EditBranchPage() {
  const navigate = useNavigate();
  const { branchId } = useParams();
  const id = Number(branchId);
  const detailPath = `/hq/branches/${branchId}`;

  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadBranch() {
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
  }, [id]);

  async function handleSubmit(values: BranchFormValues) {
    const response = await updateBranch(id, {
      name: values.name,
      address: values.address,
      phoneNumber: values.phoneNumber,
      isActive: values.status === "active",
    });

    setBranch(response.data.result);
    setSaved(true);
  }

  return (
    <main className="min-h-screen bg-background p-6 text-left text-foreground">
      <header className="flex h-12 items-center gap-3 rounded-md bg-textbox px-3">
        <Boxes className="size-4.5 text-sidebar-top" aria-hidden="true" />
        <h1 className="m-0 text-xl font-semibold tracking-normal text-active">
          Branch Management
        </h1>
      </header>

      <section className="mt-4 flex flex-col gap-1 px-3.5">
        <Link
          to={detailPath}
          className="w-fit text-xs text-primary hover:underline"
        >
          ← Back to branch details
        </Link>
        <h2 className="m-0 pt-2.5 text-xl font-semibold text-active">
          Edit branch
        </h2>
        <p className="m-0 text-xs text-searchbar">
          Update this branch&apos;s profile information. Fields marked * are
          required.
        </p>

        {loading ? (
          <div className="py-10 text-center">Loading...</div>
        ) : !branch ? (
          <div className="py-10 text-center">
            {notFound
              ? "Branch not found."
              : "Couldn't load this branch. Please try again."}
          </div>
        ) : saved ? (
          <UpdateSuccess
            branch={branch}
            onKeepEditing={() => setSaved(false)}
            onBack={() => navigate(detailPath)}
          />
        ) : (
          <BranchForm
            // Remount after "Keep editing" so the form starts from the
            // values that were just saved.
            key={branch.updatedAt}
            branchId={branch.branchId}
            initialValues={toFormValues(branch)}
            submitLabel="Save changes"
            onSubmit={handleSubmit}
            onCancel={() => navigate(detailPath)}
          />
        )}
      </section>
    </main>
  );
}
