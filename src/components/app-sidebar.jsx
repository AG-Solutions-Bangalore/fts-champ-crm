import * as React from "react"
import { ArchiveX, Command, File, Inbox, Trash2 } from "lucide-react"

import { NavUser } from "@/components/nav-user"
import { Label } from "@/components/ui/label"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"

// This is sample data
const data = {
  user: {
    name: "fts",
    email: "fts@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Master",
      url: "#",
      icon: Inbox,
      isActive: true,
      routes: [
        { name: "Donor List", url: "#", isActive: true },
        { name: "Receipt", url: "/home", isActive: false },
        { name: "Membership", url: "/other", isActive: false },
        { name: "Categories", url: "#", isActive: false }
      ]
    },
    {
      title: "Donor",
      url: "#",
      icon: File,
      isActive: false,
      routes: [
        { name: "Donor Management", url: "#", isActive: true },
    
      ]
    },
    {
      title: "Receipt",
      url: "#",
      icon: ArchiveX,
      isActive: false,
      routes: [
      
        { name: "Receipt History", url: "#", isActive: false },
        { name: "Susupense", url: "#", isActive: false }
      ]
    },
   
  ],
}

export function AppSidebar({
  ...props
}) {
  const [activeItem, setActiveItem] = React.useState(data.navMain[0])
  const [activeSubItem, setActiveSubItem] = React.useState(data.navMain[0].routes[0])
  const { setOpen } = useSidebar()

  const handleMainItemClick = (item) => {
    setActiveItem(item)
    setActiveSubItem(item.routes[0])
    setOpen(true)
  }

  const handleSubItemClick = (subItem) => {
    setActiveSubItem(subItem)
  }

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
      {...props}>
      {/* This is the first sidebar */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
      <Sidebar
        collapsible="none"
        className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <a href="#">
                  <div
                    className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Command className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">FTS Champ</span>
                    <span className="truncate text-xs">Fts crm</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      onClick={() => handleMainItemClick(item)}
                      isActive={activeItem?.title === item.title}
                      className="px-2.5 md:px-2">
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter>
      </Sidebar>
      {/* This is the second sidebar */}
      {/* We disable collapsible and let it fill remaining space */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          {/* <div className="flex w-full items-center justify-between">
            <div className="text-base font-medium text-foreground">
              {activeItem?.title}
            </div>
            <Label className="flex items-center gap-2 text-sm">
              <span> View</span>
              <Switch className="shadow-none" />
            </Label>
          </div> */}
          <SidebarInput placeholder={`Search in ${activeItem?.title}...`} />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              {activeItem?.routes.map((route) => (
                <a
                  href={route.url}
                  key={route.name}
                  onClick={() => handleSubItemClick(route)}
                  className={`flex items-center gap-3 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${activeSubItem?.name === route.name ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}`}
                >
                  <span className="font-medium">{route.name}</span>
                </a>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
}