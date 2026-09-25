import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SuccessAlert } from "@/components/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRoundCog, CircleAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "@/api/auth";
import { z } from "zod";

const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8, "Invalid password."),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match.",
    path: ["confirmNewPassword"],
  });

type ChangePasswordForm = z.infer<typeof ChangePasswordSchema>;

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const [wrongPassword, setWrongPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordForm) => {
    setWrongPassword(false);
    setShowSuccess(false);

    const result = await changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });

    if (result.error) {
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
          Edit Password
        </h1>
      </header>

      {showSuccess && (
        <SuccessAlert
          message="Edit password successfully."
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
              htmlFor="currentPassword"
              className={`text-sm ${
                wrongPassword ? "text-base-red-bright" : ""
              }`}
            >
              Current Password
            </Label>

            <Input
              id="currentPassword"
              type="password"
              className={`bg-background ${
                wrongPassword ? "border-base-red-bright" : ""
              }`}
              {...register("currentPassword")}
            />

            {wrongPassword && (
              <div className="flex flex-row items-center gap-1 text-base-red-bright text-xs">
                <CircleAlert className="mt-0.5 w-3 h-3" />
                <p>Wrong password. Please try again.</p>
              </div>
            )}
          </div>

          <div className="flex flex-col w-[380px] gap-2 text-2xl">
            <Label
              htmlFor="newPassword"
              className={`text-sm ${
                errors.newPassword ? "text-base-red-bright" : ""
              }`}
            >
              New Password
            </Label>

            <Input
              id="newPassword"
              type="password"
              className={`bg-background ${
                errors.newPassword ? "border-base-red-bright" : ""
              }`}
              {...register("newPassword")}
            />

            {errors.newPassword && (
              <div className="flex flex-row items-center gap-1 text-base-red-bright text-xs">
                <CircleAlert className="mt-0.5 w-3 h-3" />
                <p>{errors.newPassword.message}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col w-[380px] gap-2 text-2xl">
            <Label
              htmlFor="confirmNewPassword"
              className={`text-sm ${
                errors.confirmNewPassword ? "text-base-red-bright" : ""
              }`}
            >
              Confirm New Password
            </Label>

            <Input
              id="confirmNewPassword"
              type="password"
              className={`bg-background ${
                errors.confirmNewPassword ? "border-base-red-bright" : ""
              }`}
              {...register("confirmNewPassword")}
            />

            {errors.confirmNewPassword && (
              <div className="flex flex-row items-center gap-1 text-base-red-bright text-xs">
                <CircleAlert className="mt-0.5 w-3 h-3" />
                <p>{errors.confirmNewPassword.message}</p>
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
