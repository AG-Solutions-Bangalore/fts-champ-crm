import { motion } from "framer-motion";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, Package, X } from "lucide-react";

import { Badge } from "../../components/ui/badge";
import { ContextPanel } from "@/lib/context-panel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";

export const Upgrade = () => {
  const { isPanelUp } = useContext(ContextPanel);

  const navigate = useNavigate();
  const [showUpdateBadge, setShowUpdateBadge] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [showDot, setShowDot] = useState(false);

  const handleLogout = () => {
    ['token', 'id', 'name','username','chapter_id','viewer_chapter_ids','user_type_id','token-expire-time', 'ver_con', 'email','currentYear'].forEach(cookie => {
      Cookies.remove(cookie);
    });
    navigate("/");
  };


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

  return (
    <div className={cn(
      "mt-auto relative transition-all duration-300",
      showUpdateBadge ? "h-14" : "h-10"
    )}>

      {!showUpdateBadge ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg p-2 shadow-sm flex items-center justify-between hover:shadow-md transition-all cursor-default"
          layout
        >
          <div className="flex items-center gap-2">
            <Package className="w-3 h-3 text-white" />
            <span className="text-xs font-medium text-white">
              v{Cookies.get("ver_con")}
            </span>
            {showDot && (
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            )}
          </div>
          <div className="text-[10px] font-medium text-white/80">
            09-10-2025
          </div>
        </motion.div>
      ) : (
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
                Update Available
              </span>
              {showDot && (
                <Badge variant="secondary" className="w-1.5 h-1.5 p-0 bg-white animate-pulse" />
              )}
            </div>
          </div>
          <div className="text-[9px] text-white/80 mt-0.5">
            v{Cookies.get("ver_con")} → v{isPanelUp?.version?.version_panel}
          </div>
        </motion.div>
      )}

 
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
    </div>
  );
};