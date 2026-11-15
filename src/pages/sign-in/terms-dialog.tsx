import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function TermsDialog() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            type="button"
            className="text-foreground underline underline-offset-2 hover:text-primary"
          />
        }
      >
        Terms of Service and Privacy Policy
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Terms of Service and Privacy Policy</DialogTitle>
          <DialogDescription>
            Please read this before signing in to RachaCPALL.
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto text-sm">
          <section className="flex flex-col gap-2">
            <h4 className="text-base font-semibold">Terms of Service</h4>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                RachaCPALL is for authorized staff only. Accounts are created by
                an administrator.
              </li>
              <li>
                Keep your password private and do not share your account with
                others.
              </li>
              <li>Use the system only within your assigned role and branch.</li>
              <li>Sign-in activity may be recorded for security purposes.</li>
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <h4 className="text-base font-semibold">Privacy Policy</h4>

            <p className="font-medium">What we collect</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Your name, username, email, role and assigned branch.</li>
            </ul>

            <p className="font-medium">Why we collect it</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                To sign you in and show only the data and menus allowed for your
                role and branch.
              </li>
            </ul>

            <p className="font-medium">Cookies</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <span className="font-medium">Essential:</span> a session cookie
                keeps you signed in. It is removed when you sign out.
              </li>
              <li>
                <span className="font-medium">Optional:</span> with your
                consent, a cookie remembers your email on the sign-in page for
                180 days. If you decline, it is not stored.
              </li>
            </ul>

            <p className="font-medium">Your data</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Your data is used only inside RachaCPALL and is not shared with
                third parties.
              </li>
              <li>To view or correct your data, contact your administrator.</li>
            </ul>
          </section>
        </div>

        <DialogFooter>
          <DialogClose render={<Button type="button" />}>Close</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
