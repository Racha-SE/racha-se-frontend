import { Outlet } from "react-router-dom";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { Sidebar } from "@/components/sidebar";

export function Layout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Outlet />
      </div>

      <CookieConsentBanner />
    </div>
  );
}
