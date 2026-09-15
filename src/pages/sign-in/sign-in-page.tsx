import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert } from "@/components/alert";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { signInWithEmail } from "@/api/auth";
import { z } from "zod";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

const SignInSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
  terms: z.boolean().refine((value) => value === true),
});

type SignInForm = z.infer<typeof SignInSchema>;

type AlertState = {
  title: string;
  description: string;
};

export function SignInPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [alert, setAlert] = useState<AlertState | null>(null);

  const invalidToken = searchParams.get("error") === "invalid-token";

  const displayedAlert: AlertState | null = invalidToken
    ? {
        title: "Invalid Link",
        description: "This reset account link has expired.",
      }
    : alert;

  const closeAlert = () => {
    if (invalidToken) {
      setSearchParams({}, { replace: true });
      return;
    }
    setAlert(null);
  };

  const onSubmit = async (data: SignInForm) => {
    setAlert(null);

    const result = await signInWithEmail(data.email, data.password);

    if (result.error) {
      const status = result.error.status;

      if (status === 403) {
        setAlert({
          title: "Account is deactivated",
          description:
            "Please activate your account in user management. Then try again.",
        });
        return;
      }

      if (status === 401) {
        setAlert({
          title: "Invalid Email or Password",
          description: "Email or Password is incorrect.",
        });
        return;
      }
      return;
    }
    const user = result.data.user;

    if (user.role === "admin") {
      navigate("/user-management");
    } else {
      navigate("/hq/products");
    }
  };

  const { control, register, handleSubmit } = useForm<SignInForm>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
      terms: false,
    },
  });

  return (
    <div className="flex h-screen items-center justify-center w-full">
      {displayedAlert && (
        <Alert
          title={displayedAlert.title}
          description={displayedAlert.description}
          onClose={closeAlert}
        />
      )}
      <div className="flex flex-col items-center w-[706px] h-[502px] pt-[40px] gap-4 rounded-xl border border-sidebar-top bg-textbox">
        <h3 className="text-5xl font-bold">Welcome to RachaCPALL</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 w-[416px]">
            <Label htmlFor="email" className="text-base">
              Email
            </Label>
            <Input
              id="email"
              className="h-[40px] placeholder:text-base bg-background"
              type="email"
              placeholder="Email"
              {...register("email")}
            />

            <Label htmlFor="password" className="text-base">
              Password
            </Label>
            <Input
              id="password"
              className="h-[40px] placeholder:text-base bg-background"
              type="password"
              placeholder="Password"
              {...register("password")}
            />
          </div>

          <FieldGroup>
            <Controller
              name="terms"
              control={control}
              render={({ field }) => (
                <Field orientation="horizontal">
                  <Checkbox
                    id="terms"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <FieldContent>
                    <FieldLabel htmlFor="terms">
                      Accept terms and conditions
                    </FieldLabel>

                    <FieldDescription>
                      You agree to our Terms of Service and Privacy Policy
                    </FieldDescription>
                  </FieldContent>
                </Field>
              )}
            />
          </FieldGroup>

          <div className="flex justify-center">
            <Button className="primary rounded-sm" type="submit" size="lg">
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
