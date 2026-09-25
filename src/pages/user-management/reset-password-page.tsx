import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SuccessAlert } from "@/components/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRoundCog, CircleAlert } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "@/api/auth";
import { z } from "zod";

const ResetPasswordSchema = z.object({
  newPassword: z.string().min(8),
});

type ResetPasswordForm = z.infer<typeof ResetPasswordSchema>;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongPassword, setWrongPassword] = useState(false);

  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      newPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    setWrongPassword(false);
    setShowSuccess(false);

    if (!token) {
      navigate("/sign-in?error=invalid-token", {
        replace: true,
      });
      return;
    }

    const result = await resetPassword({
      newPassword: data.newPassword,
      token,
    });

    if (result.error) {
      if (result.error.code === "INVALID_TOKEN") {
        navigate("/sign-in?error=invalid-token", {
          replace: true,
        });
        return;
      }
      setWrongPassword(true);
      return;
    }

    setShowSuccess(true);
  };

  return (
    <main className="min-h-screen bg-background p-4">
      <header className="flex h-12 items-center gap-2.5 rounded-md bg-textbox px-4">
        <UserRoundCog className="size-5 text-foreground" aria-hidden="true" />
        <h1 className="m-0 text-xl font-semibold tracking-normal text-active">
          Reset Password
        </h1>
      </header>

      {showSuccess && (
        <SuccessAlert
          message="Reset password successfully."
          onClose={() => setShowSuccess(false)}
        />
      )}

      <section className="mt-6 px-3">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex w-full max-w-md flex-col gap-3"
        >
          <div className="flex flex-col w-[380px] gap-2 text-2xl">
            <Label
              htmlFor="newPassword"
              className={`text-sm ${errors.newPassword || wrongPassword ? "text-base-red-bright" : ""}`}
            >
              New Password
            </Label>

            <Input
              id="newPassword"
              type="password"
              className={`bg-background ${errors.newPassword || wrongPassword ? "border-base-red-bright" : ""}`}
              {...register("newPassword")}
            />

            {(errors.newPassword || wrongPassword) && (
              <div className="flex flex-row items-center gap-1 text-base-red-bright text-xs">
                <CircleAlert className="mt-0.5 w-3 h-3" />
                <p>Invalid password.</p>
              </div>
            )}
          </div>

          <div className="flex flex-row gap-2">
            <Button type="submit" size="lg" className="w-[70px]">
              Save
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="lg"
              className="w-[70px] bg-destructive text-background"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
