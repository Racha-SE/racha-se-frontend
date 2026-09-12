import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, UserRoundCog, Gem } from "lucide-react";

export function Sidebar() {
  return (
    <div className="flex w-[270px] shrink-0 flex-col bg-sidebar-middle gap-4 text-textbox">
      <div className="flex flex-row bg-sidebar-top gap-1 p-[10px] items-center">
        <Gem className="text-selected-tab" />
        <p className="font-medium text-xl">RachaCPALL</p>
      </div>

      <nav className="flex flex-col gap-3">
        <NavLink to="/dashboard" className="flex justify-center">
          {({ isActive }) => (
            <Button
              className={
                isActive
                  ? "flex w-[90%] h-[40px] justify-center bg-selected-tab text-white text-sm"
                  : "flex w-[90%] h-[40px] justify-center bg-sidebar-top text-sm"
              }
            >
              Dashboard
            </Button>
          )}
        </NavLink>

        <NavLink to="/inventory" className="flex justify-center">
          {({ isActive }) => (
            <Button
              className={
                isActive
                  ? "flex w-[90%] h-[40px] justify-center bg-selected-tab text-white text-sm"
                  : "flex w-[90%] h-[40px] justify-center bg-sidebar-top text-sm"
              }
            >
              Inventory
            </Button>
          )}
        </NavLink>

        <NavLink to="/product-management" className="flex justify-center">
          {({ isActive }) => (
            <Button
              className={
                isActive
                  ? "flex w-[90%] h-[40px] justify-center bg-selected-tab text-white text-sm"
                  : "flex w-[90%] h-[40px] justify-center bg-sidebar-top text-sm"
              }
            >
              Product Management
            </Button>
          )}
        </NavLink>

        <NavLink to="/user-management" className="flex justify-center">
          {({ isActive }) => (
            <Button
              className={
                isActive
                  ? "flex w-[90%] h-[40px] justify-center bg-selected-tab text-white text-sm"
                  : "flex w-[90%] h-[40px] justify-center bg-sidebar-top text-sm"
              }
            >
              User Management
            </Button>
          )}
        </NavLink>
      </nav>

      <div className="flex flex-row h-[50px] mt-auto gap-2 bg-sidebar-bottom items-center justify-center p-1">
        <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-textbox text-sm text-sidebar-top">
          A
        </div>

        <p className="text-sm">Admin</p>

        <div className="w-fit mt-1 rounded-md bg-sidebar-top px-2 py-0.5 mr-[10px]">
          <p className="text-xs">Root</p>
        </div>

        <div>
          <NavLink to="/change-password">
            <Button>
              <UserRoundCog className="h-6 w-6 text-foreground" />
            </Button>
          </NavLink>

          <Button className="bg-sidebar-bottom">
            <LogOut className="h-4 w-4 text-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
}
