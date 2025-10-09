import {  LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";

import { useState } from "react";
import Cookies from "js-cookie";
import Logout from "./auth/log-out";
import { Upgrade } from "./upgrade/upgrade";


export function NavUser({ user }) {
 
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false); 

  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const user_position = Cookies.get("email");
  const handleLogout = () => {
    ['token', 'id', 'name','username','chapter_id','viewer_chapter_ids','user_type_id','token-expire-time', 'ver_con', 'email','currentYear'].forEach(cookie => {
      Cookies.remove(cookie);
    });
    navigate("/");
  };

  const splitUser = user.name;
  const intialsChar = splitUser
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
     <Upgrade/>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-[var(--team-color)] text-black">
                    {intialsChar}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user_position}</span>
                </div>
                
                <LogOut
                onClick={() => setLogoutDialogOpen(true)}
              
                className="ml-auto size-4  hover:text-red-600 hover:scale-125 "  />
              </SidebarMenuButton>
         
        </SidebarMenuItem>
      </SidebarMenu>
    
      <Logout
              open={logoutDialogOpen}
              setOpen={setLogoutDialogOpen}
              onConfirm={handleLogout}
            />
    </>
  );
}
