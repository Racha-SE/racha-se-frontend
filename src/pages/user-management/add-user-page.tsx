import { useEffect, useState } from "react";
import { UserRoundPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getBranches, type Branch } from "@/api/branch";
import { createUser } from "@/api/user";
import { UserForm } from "./user-form";
import type { UserFormValues } from "./user-form-schema";

export function AddUserPage() {
  const navigate = useNavigate();

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

        <h1 className="m-0 text-lg font-semibold text-active">Add User</h1>
      </header>

      <section className="mt-6 px-3">
        <UserForm
          branches={branches}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </section>
    </main>
  );
}
