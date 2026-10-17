import { useEffect, useState } from "react";
import { UserRoundPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getBranches, type Branch } from "@/api/branch";
import { createUser } from "@/api/user";
import { useSession } from "@/lib/auth-client";
import { UserForm } from "./user-form";
import type { UserFormValues } from "./user-form-schema";

export function AddUserPage() {
  const navigate = useNavigate();
  const { data: session } = useSession();

  // A branch actor can create more branch managers and cashiers, but only
  // for their own branch — see MANAGEABLE_USER_TYPES in the backend's
  // hierarchy.ts. Only hq/branch ever reach this page (RequireRoot gates on
  // role === "admin"), so this is "am I HQ or a branch root".
  const isBranchActor = session?.user.userType === "branch";
  const actorBranchId = session?.user.branchId ?? undefined;

  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    async function loadBranches() {
      const response = await getBranches();

      setBranches(response.data.result);
    }

    void loadBranches();
  }, []);

  async function handleSubmit(values: UserFormValues) {
    await createUser({
      firstname: values.firstname,
      lastname: values.lastname,
      username: values.username,
      email: values.email,
      password: values.password,
      userType: values.role,

      branchId: values.role === "hq" ? null : Number(values.branchId),
    });

    navigate("/user-management");
  }

  function handleCancel() {
    navigate("/user-management");
  }

  return (
    <main className="min-h-screen bg-background p-4">
      <header className="flex h-12 items-center gap-2.5 rounded-md bg-textbox px-4">
        <UserRoundPlus className="size-5 text-foreground" aria-hidden="true" />

        <h1 className="m-0 text-xl font-semibold text-active">Add User</h1>
      </header>

      <section className="mt-6 px-3">
        <UserForm
          branches={branches}
          allowedRoles={isBranchActor ? ["branch", "cashier"] : undefined}
          lockedBranchId={isBranchActor ? actorBranchId : undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </section>
    </main>
  );
}
