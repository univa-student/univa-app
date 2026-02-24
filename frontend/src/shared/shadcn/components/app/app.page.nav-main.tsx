import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/shadcn/ui/collapsible.tsx"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/shared/shadcn/ui/sidebar.tsx"
import { Link, useLocation } from "react-router-dom"
import { ChevronRightIcon } from "lucide-react"
import React from "react";

export function AppPageNavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
    const location = useLocation()


  return (
      <SidebarGroup>
          <SidebarGroupLabel>Univa</SidebarGroupLabel>
          <SidebarMenu>
              {items.map((item) => {
                  const active =
                      item.url !== "#" && location.pathname.startsWith(item.url)

                  return (
                      <Collapsible
                          key={item.title}
                          asChild
                          defaultOpen={active || item.isActive}
                          className="group/collapsible my-0.5"
                      >
                          <SidebarMenuItem>
                              <CollapsibleTrigger asChild>
                                  <SidebarMenuButton tooltip={item.title} data-active={active}>
                                      {item.icon}
                                      <span>{item.title}</span>
                                      {item.items?.length ? (
                                          <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                      ) : null}
                                  </SidebarMenuButton>
                              </CollapsibleTrigger>

                              {item.items?.length ? (
                                  <CollapsibleContent>
                                      <SidebarMenuSub>
                                          {item.items.map((subItem) => {
                                              const subActive = location.pathname === subItem.url
                                              return (
                                                  <SidebarMenuSubItem key={subItem.title}>
                                                      <SidebarMenuSubButton asChild data-active={subActive}>
                                                          <Link to={subItem.url}>
                                                              <span>{subItem.title}</span>
                                                          </Link>
                                                      </SidebarMenuSubButton>
                                                  </SidebarMenuSubItem>
                                              )
                                          })}
                                      </SidebarMenuSub>
                                  </CollapsibleContent>
                              ) : (
                                  // якщо підменю немає — робимо весь пункт лінком
                                  <CollapsibleContent className="hidden" />
                              )}

                              {/* трюк: якщо item.items пустий, зробимо клікабельним через overlay-link */}
                              {!item.items?.length && item.url && item.url !== "#" ? (
                                  <Link
                                      to={item.url}
                                      className="absolute inset-0"
                                      aria-label={item.title}
                                  />
                              ) : null}
                          </SidebarMenuItem>
                      </Collapsible>
                  )
              })}
          </SidebarMenu>
      </SidebarGroup>
  )
}
