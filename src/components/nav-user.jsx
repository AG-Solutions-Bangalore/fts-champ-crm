import {  Download, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";

import { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import Logout from "./auth/log-out";


import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { ContextPanel } from "@/lib/context-panel";


export function NavUser({ user }) {
 
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false); 

  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const user_position = Cookies.get("email");
    const handleLogout = () => {
        ['token', 'id', 'name','username','chapter_id','viewer_chapter_ids','user_type_id','token-expire-time', 'ver_con', 'email','currentYear','favorite_chapters','recent_chapters'].forEach(cookie => {
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



    // --------------------------upgrade start-------------------
     const { isPanelUp } = useContext(ContextPanel);
    
   
      const [showUpdateBadge, setShowUpdateBadge] = useState(false);
      const [openDialog, setOpenDialog] = useState(false);
      const [showDot, setShowDot] = useState(false);
    
    
    
    
      const updateMutation = useMutation({
        mutationFn: async () => {
         
          return Promise.resolve();
        },
        onSuccess: () => {
          toast.success("Update completed successfully");
          handleLogout();
          window.location.reload();
        },
        onError: (error) => {
          console.error("Update failed:", error);
          toast.error("Update failed. Please try again.");
        }
      });
    
      useEffect(() => {
        const verCon = Cookies.get("ver_con");
        if (verCon && isPanelUp?.version?.version_panel) {
          if (verCon !== isPanelUp.version.version_panel) {
            setShowUpdateBadge(true);
            setShowDot(true);
            const dotTimer = setTimeout(() => {
              setShowDot(false);
              setOpenDialog(true);
            }, 5000);
            return () => clearTimeout(dotTimer);
          }
        }
      }, [isPanelUp]);
    
      const handleUpdate = () => {
        updateMutation.mutate();
      };
    
    // --------------------------upgrade end ---------------------

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
 
     {!showUpdateBadge ?(  <SidebarMenuButton
                size="lg"
                className="  data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
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
              </SidebarMenuButton>): (
     <div className={cn(
      "mt-auto relative transition-all duration-300 h-12",
     
    )}>

   
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-2 shadow-sm cursor-pointer hover:shadow-md transition-all border-0"
          onClick={() => setOpenDialog(true)}
          layout
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="w-3 h-3 text-white" />
              <span className="text-xs font-medium text-white">
               New Update Available
              </span>
              {showDot && (
                <Badge variant="secondary" className="w-1.5 h-1.5 p-0 bg-white animate-pulse" />
              )}
            </div>
          </div>
          <div className="text-[12px] text-white/80 mt-0.5">
            v{Cookies.get("ver_con")} → v{isPanelUp?.version?.version_panel}
          </div>
        </motion.div>
    
 
     

    </div>
        )}
        {/* logout  */}
            
         
        </SidebarMenuItem>
      </SidebarMenu>
    
      <Logout
              open={logoutDialogOpen}
              setOpen={setLogoutDialogOpen}
              onConfirm={handleLogout}
            />
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-xs p-4 gap-4">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Download className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <DialogTitle className="text-sm font-semibold">
                  Update Available
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Version v{isPanelUp?.version?.version_panel}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="text-sm text-muted-foreground">
            A new version is ready to install. Update now to get the latest features and improvements.
          </div>

          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              className={cn(
                "flex-1",
                updateMutation.isPending && "opacity-50 cursor-not-allowed"
              )}
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Updating..." : "Update Now"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setOpenDialog(false)}
            >
              Later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
