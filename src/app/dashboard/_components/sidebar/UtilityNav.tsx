import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar"
import { SidebarMenuButton } from "@/app/dashboard/_components/sidebar/SidebarNavLink"
import type { Route } from "@/app/dashboard/_components/sidebar/types"

const utilityRoutes: Route[] = [
  {
    label: "Documents",
    href: "/dashboard/documents",
    icon: 'ClipboardList'
  },
  {
    label: "Components",
    href: "/dashboard/components",
    icon: 'Collection'
  },
  {
    label: "Help",
    href: "/dashboard/help",
    icon: 'Support'
  },
]

export function UtilityNav() {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {
            utilityRoutes.map((route) => (
              <SidebarMenuItem key={route.label}>
                <SidebarMenuButton route={route} />
              </SidebarMenuItem>
            ))
          }
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}