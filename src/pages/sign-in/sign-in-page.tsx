import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert } from "@/components/alert";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

const SignInSchema = z.object({
  username: z.string(),
  password: z.string(),
  terms: z.boolean().refine((value) => value === true),
});

type SignInForm = z.infer<typeof SignInSchema>;

export function SignInPage() {
  const [showAlert, setShowAlert] = useState(false);

  const onSubmit = (data: SignInForm) => {
    console.log(data);

    setShowAlert(true);
  };

  const { control, register, handleSubmit } = useForm<SignInForm>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      username: "",
      password: "",
      terms: false,
    },
  });

  return (
    <div className="flex h-screen items-center justify-center w-full">
      {showAlert && (
        <Alert
          title="Invalid Username"
          description="This username doesn't exist."
          onClose={() => setShowAlert(false)}
        />
      )}
      <div className="flex flex-col items-center w-[706px] h-[502px] pt-[40px] gap-4 rounded-xl border border-sidebar-top bg-textbox">
        <h3 className="text-5xl font-bold">Welcome to RachaCPALL</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 w-[416px]">
            <Label htmlFor="username" className="text-base">
              Username
            </Label>
            <Input
              id="username"
              className="h-[40px] placeholder:text-base bg-background"
              type="text"
              placeholder="Username"
              {...register("username")}
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
