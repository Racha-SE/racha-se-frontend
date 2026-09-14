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
    <div className="flex min-h-screen flex-col items-center gap-15">
      {showSuccess && (
        <SuccessAlert
          message="Reset password successfully."
          onClose={() => setShowSuccess(false)}
        />
      )}

      <div className="flex flex-row w-[1150px] h-[70px] gap-2 mt-4 p-[15px] rounded-sm items-center bg-textbox">
        <UserRoundCog />
        <h4 className="font-medium text-xl text-active-state">Edit Password</h4>
      </div>

      <div className="w-[500px] min-h-[230px] bg-textbox rounded-sm">
        <div className="flex flex-row w-[230px] h-[60px] gap-2 mt-4 ml-3 p-[15px] rounded-sm items-center bg-background">
          <UserRoundCog />
          <h4 className="font-medium text-xl text-active-state">
            Reset Password
          </h4>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col p-[15px] gap-3"
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
      </div>
    </div>
  );
}
