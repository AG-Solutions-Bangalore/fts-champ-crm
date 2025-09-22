import * as React from "react";
import {
  AudioWaveform,
  
  Command,

  GalleryVerticalEnd,

  LayoutDashboard,  
    FileText,        
    BookOpen,       
    Book,          
    Scale,            
    Box,            
    Mountain,        
    SquareStack,     
    ShoppingCart,    
    Warehouse,
    Frame,
    ShoppingBag,
    Package,
    Settings2,
    Settings,
    Blocks,  
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import {  NavMainUser } from "./nav-main-user";
import Cookies from "js-cookie";
import { NavMainReport } from "./nav-main-report";

export function AppSidebar({ ...props }) {
  const nameL = Cookies.get("name");
  const emailL = Cookies.get("email");

  const initialData = {
    user: {
      name: `${nameL}`,
      email: `${emailL}`,
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      {
        name: `FTS CHAMP DEV`,
        logo: GalleryVerticalEnd,
        plan: "",
      },
      {
        name: "Acme Corp.",
        logo: AudioWaveform,
        plan: "Startup",
      },
      {
        name: "Evil Corp.",
        logo: Command,
        plan: "Free",
      },
    ],
    navMain: [
      {
        title: "Dashboard",
        url: "/home",
        icon: Frame,
        isActive: false,
      },
      {
        title: "Master Settings",
        url: "#",
        isActive: false,
        icon: Settings2,
        items: [
          {
            title: "Chapter",
            url: "/master/chapter",
          },
          {
            title: "States",
            url: "/master/states",
          },
          {
            title: "Designation",
            url: "/master/designation",
          },
          {
            title: "OTS Expensive Type",
            url: "/master/ots-expensive-type",
          },
          {
            title: "Data Source",
            url: "/master/data-source",
          },
          {
            title: "Viewer",
            url: "/donor/viewer",
          },
         
        ],
      },
     
      {
        title: "MemberShip",
        url: "/membership",
        icon: ShoppingBag,
        isActive: false,
      },
      {
        title: "Donor",
        url: "#",
        isActive: false,
        icon: Package,
        items: [
          {
            title: "Donor List",
            url: "/donor/donors",
          },
          
          {
            title: "Duplicate",
            url: "/donor/duplicate",
          },
        
          
         
        ],
      },
      {
        title: "Receipt",
        url: "/receipt",
        isActive: false,
        icon: Package,
        // create  create receipt inside receipt list
        
      },
      {
        title: "School",
        url: "#",
        isActive: false,
        icon: Package,
        items: [
          {
            title: "School List",
            url: "/school/donors",
          },
          
          {
            title: "School Allotment",
            url: "/school/duplicate",
          },
          {
            title: "School Alloted",
            url: "/school/duplicate",
          },
          {
            title: "Repeated Donor",
            url: "/school/duplicate",
          },
        
          
         
        ],
      },
    ],
    // schoolManagement:[
    //   {
    //     name: "School List",
    //     url: "/school-list",
    //     icon: Frame,
    //   },
    //   {
    //     name: "School Allotment",
    //     url: "/school-allotment",
    //     icon: Settings,
    //   },
    //   {
    //     name: "School Alloted",
    //     url: "/school-alloted",
    //     icon: Settings,
    //   },
    //   {
    //     name: "Repeated Donor",
    //     url: "/repeated-donor",
    //     icon: Settings,
    //   },
    // ],
    navMainReport: [
    
      {
        title: "Report",
        url: "#",
        isActive: false,
        icon: Settings2,
        items: [
          {
            title: "Donor",
            url: "/report/donor",
          },
          {
            title: "Promoter",
            url: "/report/promoter",
          },
          {
            title: "Receipt",
            url: "/report/receipt",
          },
          {
            title: "School",
            url: "/report/school",
          },
          {
            title: "10DB Statement",
            url: "/report/10db-statement",
          },
          {
            title: "Suspense",
            url: "/report/suspense",
          },
         
         
        ],
      },
     
     
      {
        title: "Download",
        url: "#",
        isActive: false,
        icon: Package,
        items: [
          {
            title: "Receipt",
            url: "/download/receipt",
          },
          {
            title: "Donor",
            url: "/download/donor",
          },
          {
            title: "School",
            url: "/download/school",
          },
          {
            title: "OTS",
            url: "/download/ots",
          },
          {
            title: "Team",
            url: "/download/team",
          },
          {
            title: "All Receipt",
            url: "/download/all-receipt",
          },
         
         
        ],
      },
      {
        title: "Other",
        url: "#",
        isActive: false,
        icon: Package,
        items: [
          {
            title: "Faq",
            url: "/other/faq",
          },
          {
            title: "Team",
            url: "/other/team",
          },
          {
            title: "Notification",
            url: "/other/notification",
          },
        ],
      },
      {
        title: "Setting",
        url: "/setting",
        icon: Blocks,
        isActive: false,
      },
     
    
     
    ],
  };
  

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={initialData.teams} />
      </SidebarHeader>
      <SidebarContent className="sidebar-content">
      
        <NavMain items={initialData.navMain} />
   
        {/* <NavMainUser projects={initialData.schoolManagement} /> */}
        <NavMainReport items={initialData.navMainReport} />
        {/* <NavMainUser projects={initialData.schoolManagement} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={initialData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}


//changes 