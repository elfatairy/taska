"use client"

import { ChevronRight } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuAction, SidebarMenuItem, SidebarMenuSub as SidebarMenuSubBase, SidebarMenuSubItem } from "@/components/ui/sidebar"
import { SidebarMenuSubButton, SidebarMenuButton } from "@/features/sidebar/components/SidebarMenuButton"
import type { SidebarRoute } from "@/features/sidebar/types"
import { Separator } from "@/components/ui/separator"
import { useGetSidebarRoutes } from "../hooks/useGetSidebarRoutes"
import { SidebarNavSkeleton } from "./SidebarSkeleton"
import React from "react"

export function SidebarNav() {
  const { routes, isLoaded } = useGetSidebarRoutes();

  if (!isLoaded) {
    return <SidebarNavSkeleton />;
  }

  return (
    <>
      {
        routes.map((group, index) => (
          <React.Fragment key={group.label}>
            <SidebarGroup>
              {group.showLabel && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {
                    group.routes?.map((route) => (
                      route.children ? (
                        <Collapsible
                          key={route.label}
                          defaultOpen
                          className="group/collapsible"
                        >
                          <SidebarMenuItem>
                            <SidebarMenuButton route={route} />

                            <CollapsibleTrigger asChild>
                              <SidebarMenuAction className="w-6 h-6 flex items-center justify-center" aria-label="Toggle Submenu">
                                <ChevronRight className="transition-transform group-data-[state=open]/collapsible:rotate-90" />
                              </SidebarMenuAction>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                              <SidebarMenuSub subRoutes={route.children} />
                            </CollapsibleContent>
                          </SidebarMenuItem>
                        </Collapsible>
                      ) : (
                        <SidebarMenuItem key={route.label}>
                          <SidebarMenuButton route={route} />
                        </SidebarMenuItem>
                      )
                    ))
                  }
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {index < routes.length - 1 && <Separator />}
          </React.Fragment>
        ))
      }
    </>
  )
}

function SidebarMenuSub({ subRoutes }: { subRoutes: SidebarRoute[] }) {
  return (
    <SidebarMenuSubBase>
      {
        subRoutes.map((child) => (
          <SidebarMenuSubItem key={child.label} className='pl-2'>
            <SidebarMenuSubButton route={child} />
          </SidebarMenuSubItem>
        ))
      }
    </SidebarMenuSubBase>
  )
}