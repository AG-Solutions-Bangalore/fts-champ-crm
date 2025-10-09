import {
  AudioWaveform,
  Blocks,
  Command,
  Frame,
  GalleryVerticalEnd,
  Package,
  Settings2,
  ShoppingBag,
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
import Cookies from "js-cookie";
import { NavMainReport } from "./nav-main-report";
import { useState } from "react";

export function AppSidebar({ ...props }) {
  const nameL = Cookies.get("name");
  const emailL = Cookies.get("email");
  const [openItem, setOpenItem] = useState(null);
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
        title: "Chapter",
        url: "/chapter",
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
            title: "Chapters",
            url: "/master/chapter",
          },

          {
            title: "Viewer",
            url: "/master/viewer",
          },
        ],
      },
      {
        title: "MemberShip",
        url: "#",
        isActive: false,
        icon: ShoppingBag,
        items: [
          {
            title: "Dashboard",
            url: "/membership/dashboard",
          },

          {
            title: "Active Membership",
            url: "/membership/active",
          },

          {
            title: "InActive Membership",
            url: "/membership/inactive",
          },
        ],
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
            url: "/school/list",
          },

          {
            title: "School To Allot",
            url: "/school/to-allot",
          },
          {
            title: "School Alloted",
            url: "/school/alloted",
          },
          {
            title: "Repeated Donor",
            url: "/school/repeated",
          },
        ],
      },
    ],
    navMainReport: [
      {
        title: "Summary",
        url: "#",
        isActive: false,
        icon: Settings2,
        items: [
          {
            title: "Donor",
            url: "/report/donor-summary",
          },
          {
            title: "Promoter",
            url: "/report/promoter-summary",
          },
          {
            title: "Receipt",
            url: "/report/receipt-summary",
          },

          {
            title: "Donation",
            url: "/report/donation-summary",
          },
          {
            title: "School",
            url: "/report/school-summary",
          },
          {
            title: "10DB Statement",
            url: "/report/10db-statement-summary",
          },
          {
            title: "Suspense",
            url: "/report/suspense-summary",
          },
        ],
      },

      {
        title: "Downloads",
        url: "/download",
        icon: Blocks,
        isActive: false,
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
        title: "Settings",
        url: "/settings",
        icon: Blocks,
        isActive: false,
      },
      {
        title: "Change Promoter-S",
        url: "/change-promoter",
        icon: Blocks,
        isActive: false,
      },
      {
        title: "Recepit-S",
        url: "/recepit/zero-list",
        icon: Blocks,
        isActive: false,
      },
      {
        title: "C-Recepit-Donor",
        url: "/recepit/change-donor",
        icon: Blocks,
        isActive: false,
      },
      {
        title: "M-Recepit",
        url: "/recepit/multiple-list",
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
        <NavMain
          items={initialData.navMain}
          openItem={openItem}
          setOpenItem={setOpenItem}
        />

        {/* <NavMainUser projects={initialData.schoolManagement} /> */}
        <NavMainReport
          items={initialData.navMainReport}
          openItem={openItem}
          setOpenItem={setOpenItem}
        />
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
