import { ChevronRight } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/common/components/ui/collapsible"
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuAction, SidebarMenuItem, SidebarMenuSub as SidebarMenuSubBase, SidebarMenuSubItem } from "@/common/components/ui/sidebar"
import { SidebarMenuSubButton, SidebarMenuButton } from "@/common/layout/sidebar/components/SidebarMenuButton"
import type { SidebarNav, SidebarRoute } from "@/common/layout/sidebar/types"
import { Separator } from "@/common/components/ui/separator"
import React from "react"

export function SidebarRoutes({ routes }: { routes: SidebarNav }) {
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
        subRoutes.map((child) => {
          return child.children ? (
            <Collapsible
              key={child.label}
              defaultOpen
              className="group/collapsible"
            >
              <SidebarMenuSubItem>
                <SidebarMenuSubButton route={child} />

                <CollapsibleTrigger asChild>
                  <SidebarMenuAction className="w-6 h-6 flex items-center justify-center" aria-label="Toggle Submenu">
                    <ChevronRight className="transition-transform group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuAction>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarMenuSub subRoutes={child.children} />
                </CollapsibleContent>
              </SidebarMenuSubItem>
            </Collapsible>
          ) : (
            <SidebarMenuSubItem key={child.label} className='pl-2'>
              <SidebarMenuSubButton route={child} />
            </SidebarMenuSubItem>
          )
        })
      }
    </SidebarMenuSubBase>
  )
}
