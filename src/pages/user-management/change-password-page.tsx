import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SuccessAlert } from "@/components/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRoundCog } from "lucide-react";
import { CircleAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Invalid password."),
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
    },
  });

  const onSubmit = (data: ChangePasswordForm) => {
    setWrongPassword(true);
    setShowSuccess(true);

    console.log(data);
  };

  const handleForgotPassword = async () => {
    console.log("sent");
  };

  return (
    <div className="flex min-h-screen flex-col items-center gap-15">
      {showSuccess && (
        <SuccessAlert
          message="Edit password successfully."
          onClose={() => setShowSuccess(false)}
        />
      )}
      <div className="flex flex-row w-[1150px] h-[70px] gap-2 mt-4 p-[15px] rounded-sm items-center bg-textbox">
        <UserRoundCog />
        <h4 className="font-medium text-xl text-active-state">Edit Password</h4>
      </div>

      <div className="w-[500px] min-h-[330px] bg-textbox rounded-sm">
        <div className="flex flex-row w-[220px] h-[60px] gap-2 mt-4 ml-3 p-[15px] rounded-sm items-center bg-background">
          <UserRoundCog />
          <h4 className="font-medium text-xl text-active-state">
            Edit Password
          </h4>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col p-[15px] gap-3"
        >
          <div className="flex flex-col w-[380px] gap-2 text-2xl">
            <Label
              htmlFor="currentPassword"
              className={`text-sm ${wrongPassword ? "text-invalid" : ""}`}
            >
              Current Password
            </Label>

            <Input
              id="currentPassword"
              type="password"
              className={`bg-background ${wrongPassword ? "border-invalid" : ""}`}
              {...register("currentPassword")}
            />

            {wrongPassword && (
              <div className="flex flex-row items-center gap-1 text-invalid text-xs">
                <CircleAlert className="mt-0.5 w-3 h-3" />
                <p>Wrong password. Please try again.</p>
              </div>
            )}
          </div>

          <div className="flex flex-col w-[380px] gap-2 text-2xl">
            <Label
              htmlFor="newPassword"
              className={`text-sm ${errors.newPassword ? "text-invalid" : ""}`}
            >
              New Password
            </Label>

            <Input
              id="newPassword"
              type="password"
              className={`bg-background ${errors.newPassword ? "border-invalid" : ""}`}
              {...register("newPassword")}
            />

            {errors.newPassword && (
              <div className="flex flex-row items-center gap-1 text-invalid text-xs">
                <CircleAlert className="mt-0.5 w-3 h-3" />
                <p>{errors.newPassword.message}</p>
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
              className="text-sm text-active-state underline"
            >
              Forgot Password?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
