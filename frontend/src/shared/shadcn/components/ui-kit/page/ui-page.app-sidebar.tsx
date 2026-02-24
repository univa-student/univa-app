"use client"

import * as React from "react"

import { UiPageNavMain } from "@/shared/shadcn/components/ui-kit/page/ui-page.nav-main.tsx"
import { UiPageNavProjects } from "@/shared/shadcn/components/ui-kit/page/ui-page.nav-projects.tsx"
import { UiPageNavSecondary } from "@/shared/shadcn/components/ui-kit/page/ui-page.nav-secondary.tsx"
import { UiPageNavUser } from "@/shared/shadcn/components/ui-kit/page/ui-page.nav-user.tsx"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/shadcn/ui/sidebar.tsx"
import {
    BotIcon,
    BookOpenIcon,
    Settings2Icon,
    LifeBuoyIcon,
    SendIcon,
    FrameIcon,
    PieChartIcon,
    MapIcon, Globe
} from "lucide-react"
import logoConfig from "@/app/config/logo.config.ts";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Website",
      url: "#",
      icon: (
        <Globe />
      ),
      isActive: true,
      items: [
        {
          title: "Blocks",
          url: "#",
        },
        {
          title: "Components",
          url: "#",
        },
        {
          title: "UI",
          url: "#",
        },
        {
          title: "Pictures",
          url: "#",
        },
        {
          title: "Animations",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: (
        <BotIcon
        />
      ),
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: (
        <BookOpenIcon
        />
      ),
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: (
        <Settings2Icon
        />
      ),
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: (
        <LifeBuoyIcon
        />
      ),
    },
    {
      title: "Feedback",
      url: "#",
      icon: (
        <SendIcon
        />
      ),
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: (
        <FrameIcon
        />
      ),
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: (
        <PieChartIcon
        />
      ),
    },
    {
      name: "Travel",
      url: "#",
      icon: (
        <MapIcon
        />
      ),
    },
  ],
}

export function UiPageAppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/ui-kit-page">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                    <img
                        src={logoConfig["logo-white-no-bg"]}
                        alt="Univa logo"
                    />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                      Univa
                  </span>
                  <span className="truncate text-xs">
                      UI Kit page
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <UiPageNavMain items={data.navMain} />
        <UiPageNavProjects projects={data.projects} />
        <UiPageNavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <UiPageNavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
