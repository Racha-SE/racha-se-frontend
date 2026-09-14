import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, UserRoundCog, Gem } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { signOut } from "@/api/auth";
import { useSession } from "@/lib/auth-client";

export function Sidebar() {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const user = session?.user;
  const isRoot = user?.role === "admin";
  const firstName = user?.firstname ?? "";
  const initial = firstName.charAt(0).toUpperCase();
  const roleLabel = user ? (isRoot ? "Root" : "HQ") : "";

  const handleLogout = async () => {
    const result = await signOut();

    if (result.error) {
      return;
    }

    navigate("/sign-in", { replace: true });
    console.log(result);
  };

  return (
    <div className="flex w-[270px] shrink-0 flex-col bg-sidebar-middle gap-4 text-textbox">
      <div className="flex flex-row bg-sidebar-top gap-1 p-[10px] items-center">
        <Gem className="text-focus" />
        <p className="font-medium text-xl">RachaCPALL</p>
      </div>

      <nav className="flex flex-col gap-3">
        <NavLink to="/hq/products" end className="flex justify-center">
          {({ isActive }) => (
            <Button
              className={
                isActive
                  ? "flex w-[90%] h-[40px] justify-center bg-focus text-white text-sm"
                  : "flex w-[90%] h-[40px] justify-center bg-sidebar-top text-sm"
              }
            >
              Product Management
            </Button>
          )}
        </NavLink>

        <NavLink to="/hq/products/categories" className="flex justify-center">
          {({ isActive }) => (
            <Button
              className={
                isActive
                  ? "flex w-[90%] h-[40px] justify-center bg-focus text-white text-sm"
                  : "flex w-[90%] h-[40px] justify-center bg-sidebar-top text-sm"
              }
            >
              Categories
            </Button>
          )}
        </NavLink>

        <NavLink to="/hq/inventory" className="flex justify-center">
          {({ isActive }) => (
            <Button
              className={
                isActive
                  ? "flex w-[90%] h-[40px] justify-center bg-focus text-white text-sm"
                  : "flex w-[90%] h-[40px] justify-center bg-sidebar-top text-sm"
              }
            >
              Inventory
            </Button>
          )}
        </NavLink>

        <NavLink to="/hq/notifications" className="flex justify-center">
          {({ isActive }) => (
            <Button
              className={
                isActive
                  ? "flex w-[90%] h-[40px] justify-center bg-focus text-white text-sm"
                  : "flex w-[90%] h-[40px] justify-center bg-sidebar-top text-sm"
              }
            >
              Notifications
            </Button>
          )}
        </NavLink>

        {isRoot && (
          <NavLink to="/user-management" className="flex justify-center">
            {({ isActive }) => (
              <Button
                className={
                  isActive
                    ? "flex w-[90%] h-[40px] justify-center bg-focus text-white text-sm"
                    : "flex w-[90%] h-[40px] justify-center bg-sidebar-top text-sm"
                }
              >
                User Management
              </Button>
            )}
          </NavLink>
        )}
      </nav>

      <div className="mt-auto flex h-[50px] flex-row items-center gap-2 bg-sidebar-bottom px-3">
        <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-textbox text-sm text-sidebar-top">
          {initial}
        </div>

        <p className="min-w-0 truncate text-sm">{firstName}</p>

        <div className="mt-1 w-fit shrink-0 rounded-md bg-sidebar-top px-2 py-0.5">
          <p className="text-xs">{roleLabel}</p>
        </div>

        <div className="ml-auto flex shrink-0">
          <NavLink to="/change-password">
            <Button>
              <UserRoundCog className="h-6 w-6 text-foreground" />
            </Button>
          </NavLink>

          <Button
            type="button"
            className="bg-sidebar-bottom"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 text-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
}
