import { useState } from "react";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return null;
  }

  return (
    <div
      aria-label="Cookie consent"
      className="fixed right-4 bottom-4 left-[286px] z-50 flex items-center gap-4 rounded-sm border-2 border-alert-border bg-surface p-[20px] shadow-md animate-in slide-in-from-bottom-5"
    >
      <Cookie className="size-6 shrink-0 text-focus" />
      <div className="flex flex-1 flex-col gap-1">
        <p className="font-bold">We use cookies</p>
        <p className="font-light text-sidebar-middle">
          With your permission, we save a cookie that remembers your email so it
          is filled in the next time you sign in. If you decline, we only keep
          the cookie needed to keep you signed in.
        </p>
      </div>

      <div className="flex shrink-0 gap-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => setVisible(false)}
        >
          Decline
        </Button>
        <Button
          type="button"
          className="bg-focus"
          size="lg"
          onClick={() => setVisible(false)}
        >
          Accept
        </Button>
      </div>
    </div>
  );
}
