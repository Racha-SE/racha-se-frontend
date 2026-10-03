import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert } from "@/components/alert";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { requestPasswordReset, signInWithEmail } from "@/api/auth";
import { z } from "zod";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

const SignInSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
  terms: z.boolean().refine((value) => value === true, {
    message: "Please accept the terms and conditions to continue.",
  }),
});

type SignInForm = z.infer<typeof SignInSchema>;

const ForgotPasswordSchema = z.object({
  email: z.email(),
});

type ForgotPasswordForm = z.infer<typeof ForgotPasswordSchema>;

type AlertState = {
  title: string;
  description: string;
  variant?: "error" | "info";
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

  const [signInError, setSignInError] = useState<string | null>(null);

  const onSubmit = async (data: SignInForm) => {
    setSignInError(null);

    const result = await signInWithEmail(data.email, data.password);

    if (result.error) {
      const status = result.error.status;

      if (status === 403) {
        setSignInError(
          "Your account is deactivated. Please activate it in user management.",
        );
        return;
      }

      if (status === 401) {
        setSignInError("Email or password is incorrect.");
        return;
      }
      return;
    }
    const user = result.data.user;

    if (user.role === "admin") {
      navigate("/user-management");
    } else if (user.userType === "cashier") {
      navigate("/cashier");
    } else {
      navigate("/hq/products");
    }
  };

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
      terms: false,
    },
  });

  const formErrorMessage =
    errors.email || errors.password
      ? "Please enter your email and password."
      : errors.terms
        ? "Please accept the terms and conditions to continue."
        : signInError;

  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const {
    register: registerForgotPassword,
    handleSubmit: handleForgotPasswordSubmit,
    reset: resetForgotPasswordForm,
    formState: { errors: forgotPasswordErrors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onForgotPasswordOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForgotPasswordForm();
    setForgotPasswordOpen(nextOpen);
  };

  const onForgotPasswordSubmit = async (data: ForgotPasswordForm) => {
    const result = await requestPasswordReset({
      email: data.email,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (result.error) {
      return;
    }

    setForgotPasswordOpen(false);
    resetForgotPasswordForm();
    setAlert({
      title: "We have sent you a password reset link",
      description: "You can reset the password of your account via email.",
      variant: "info",
    });
  };

  return (
    <div className="flex h-screen items-center justify-center w-full">
      {displayedAlert && (
        <Alert
          title={displayedAlert.title}
          description={displayedAlert.description}
          variant={displayedAlert.variant}
          onClose={closeAlert}
        />
      )}
      <div className="flex flex-col items-center w-[706px] h-[502px] pt-[40px] gap-4 rounded-xl border border-sidebar-top bg-textbox">
        <h3 className="text-5xl font-bold">Welcome to RachaCPALL</h3>

        <form
          onSubmit={handleSubmit(onSubmit, () => setSignInError(null))}
          noValidate
          className="flex flex-col gap-4"
        >
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

            <button
              type="button"
              onClick={() => setForgotPasswordOpen(true)}
              className="self-end text-sm text-searchbar underline"
            >
              Forgot Password?
            </button>
          </div>

          <div className="flex flex-col items-center gap-1">
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

            <p
              className={`w-[416px] text-sm text-destructive ${
                formErrorMessage ? "" : "invisible"
              }`}
            >
              {formErrorMessage}
            </p>
          </div>

          <div className="flex justify-center">
            <Button className="primary rounded-sm" type="submit" size="lg">
              Sign in
            </Button>
          </div>
        </form>
      </div>

      <Dialog
        open={forgotPasswordOpen}
        onOpenChange={onForgotPasswordOpenChange}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Forgot Password</DialogTitle>
            <DialogDescription className="whitespace-nowrap">
              Enter your email and we&apos;ll send you a link to reset your
              password.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleForgotPasswordSubmit(onForgotPasswordSubmit)}
            noValidate
            className="flex flex-col gap-2"
          >
            <Label htmlFor="forgot-password-email">Email</Label>
            <Input
              id="forgot-password-email"
              type="email"
              placeholder="Email"
              aria-invalid={!!forgotPasswordErrors.email}
              {...registerForgotPassword("email")}
            />
            <FieldError errors={[forgotPasswordErrors.email]} />

            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>
                Cancel
              </DialogClose>
              <Button type="submit">Send reset link</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
