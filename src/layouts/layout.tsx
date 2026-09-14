import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/sidebar";

export function Layout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
