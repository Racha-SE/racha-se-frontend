import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, SuccessAlert } from "@/components/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRoundCog, CircleAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { changePassword, getSession, requestPasswordReset } from "@/api/auth";
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
  const [showForgotPasswordAlert, setShowForgotPasswordAlert] = useState(false);

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

  const handleForgotPassword = async () => {
    const session = await getSession();

    if (!session.data?.user?.email) {
      return;
    }

    const result = await requestPasswordReset({
      email: session.data.user.email,
      redirectTo: "http://localhost:5173/reset-password",
    });

    if (result.error) {
      return;
    }
    setShowForgotPasswordAlert(true);
  };

  return (
    <div className="flex min-h-screen flex-col items-center gap-15">
      {showSuccess && (
        <SuccessAlert
          message="Edit password successfully."
          onClose={() => setShowSuccess(false)}
        />
      )}

      {showForgotPasswordAlert && (
        <Alert
          title="We have sent you password reset link"
          description="You can reset the password of your account via email."
          variant="info"
          onClose={() => setShowForgotPasswordAlert(false)}
        />
      )}

      <div className="flex flex-row w-[1150px] h-[70px] gap-2 mt-4 p-[15px] rounded-sm items-center bg-textbox">
        <UserRoundCog />
        <h4 className="font-medium text-xl text-active">Edit Password</h4>
      </div>

      <div className="w-[500px] min-h-[400px] bg-textbox rounded-sm">
        <div className="flex flex-row w-[220px] h-[60px] gap-2 mt-4 ml-3 p-[15px] rounded-sm items-center bg-background">
          <UserRoundCog />
          <h4 className="font-medium text-xl text-active">Edit Password</h4>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col p-[15px] gap-3"
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

            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-searchbar underline"
            >
              Forgot Password?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
