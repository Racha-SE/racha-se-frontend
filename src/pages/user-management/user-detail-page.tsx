import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getBranchById } from "@/api/branch";
import { getUserById, type User } from "@/api/user";

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

function DetailField({
  label,
  value,
  disabled = false,
}: {
  label: string;
  value: string;
  disabled?: boolean;
}) {
  return (
    <div className="w-[320px]">
      <p className="mb-1 text-sm text-active">{label}</p>

      <div
        className={`min-h-9 rounded-md border border-input px-3 py-2 text-sm ${
          disabled ? "bg-currency-card" : "bg-background"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export function UserDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [user, setUser] = useState<User | null>(null);
  const [branchName, setBranchName] = useState("-");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const response = await getUserById(id);
        setUser(response.data);

        if (response.data.branchId !== null) {
          const branchResponse = await getBranchById(response.data.branchId);
          setBranchName(branchResponse.data.result.name);
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setLoading(false);
      }
    }

    void loadUser();
  }, [id]);

  if (loading) {
    return <main className="min-h-screen bg-background p-6">Loading...</main>;
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-background p-6">User not found</main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <header className="flex h-12 items-center gap-3 rounded-md bg-textbox px-4">
        <Eye className="size-5" aria-hidden="true" />

        <h1 className="text-lg font-semibold text-active">User Details</h1>
      </header>

      <section className="mt-6 space-y-4 px-3">
        <DetailField label="UserID" value={user.id} disabled />
        <DetailField label="Username" value={user.username} />
        <DetailField label="Gmail" value={user.email} />
        <DetailField label="Role" value={getRoleLabel(user)} />
        <DetailField label="Branch" value={branchName} />
        <DetailField
          label="Status"
          value={user.banned ? "Inactive" : "Active"}
        />

        <Button
          type="button"
          className="mt-4"
          onClick={() => navigate("/user-management")}
        >
          Close
        </Button>
      </section>
    </main>
  );
}
