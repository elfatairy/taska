import { ChevronRight } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuAction, SidebarMenuItem, SidebarMenuSub as SidebarMenuSubBase,  SidebarMenuSubItem } from "@/components/ui/sidebar"
import { SidebarMenuSubButton, SidebarMenuButton } from "@/app/dashboard/_components/sidebar/SidebarNavLink"
import type { Route } from "@/app/dashboard/_components/sidebar/types"

export const mainRoutes: Route[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: 'ChartPie'
  },
  {
    label: "Pages",
    href: "/dashboard/pages",
    icon: "DocumentReport",
    children: [
      {
        label: "Users",
        href: "/dashboard/pages/users",
      },
      {
        label: "Profile",
        href: "/dashboard/pages/profile"
      },
      {
        label: "Settings",
        href: "/dashboard/pages/settings",
      },
      {
        label: "Pricing",
        href: "/dashboard/pages/pricing",
      },
      {
        label: "Calendar",
        href: "/dashboard/pages/calendar",
      },
      {
        label: "Kanban",
        href: "/dashboard/pages/kanban",
      }
    ],
  },
  {
    label: "Sales",
    href: "/dashboard/sales",
    icon: 'ShoppingBag',
    children: [
      {
        label: "Product List",
        href: "/dashboard/sales/product-list",
      },
      {
        label: "Billing",
        href: "/dashboard/sales/billing",
      },
      {
        label: "Invoice",
        href: "/dashboard/sales/invoice",
      },
    ],
  },
  {
    label: "Messages",
    href: "/dashboard/messages",
    icon: 'InboxIn'
  },
  {
    label: "Authentication",
    href: "/dashboard/authentication",
    icon: 'LockClosed'
  }
]

export function MainNav() {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {
            mainRoutes.map((route) => (
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
  )
}

function SidebarMenuSub({ subRoutes }: { subRoutes: Route[] }) {
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