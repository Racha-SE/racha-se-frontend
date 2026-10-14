import { Boxes } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { createBranch } from "@/api/branch";

import { BranchForm } from "./branch-form";
import type { BranchFormValues } from "./branch-form-schema";

export function CreateBranchPage() {
  const navigate = useNavigate();

  async function handleSubmit(values: BranchFormValues) {
    const response = await createBranch({
      name: values.name,
      address: values.address,
      phoneNumber: values.phoneNumber,
      isActive: values.status === "active",
    });

    navigate(`/hq/branches/${response.data.result.branchId}`);
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
          to="/hq/branches"
          className="w-fit text-xs text-primary hover:underline"
        >
          ← Back to branches
        </Link>
        <h2 className="m-0 pt-2.5 text-xl font-semibold text-active">
          Create new branch
        </h2>
        <p className="m-0 text-xs text-searchbar">
          Register a new branch location. Fields marked * are required.
        </p>

        <BranchForm
          submitLabel="Create branch"
          onSubmit={handleSubmit}
          onCancel={() => navigate("/hq/branches")}
        />
      </section>
    </main>
  );
}
