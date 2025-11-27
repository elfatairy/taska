import AppLogo from "@/components/AppLogo";
import SearchBar from "@/components/SearchBar";
import { Separator } from "@/components/ui/separator";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import ProfileSidebarTrigger from "@/features/profile/SidebarTrigger";
import { MainNav } from "@/app/dashboard/_components/sidebar/MainNav";
import { UtilityNav } from "@/app/dashboard/_components/sidebar/UtilityNav";

export function DashboardSidebar() {
  return (
    <Sidebar className="top-(--header-height) h-[calc(100svh-var(--header-height))]">
      <SidebarContent>
        <SidebarHeader className="ml-2 md:hidden flex-row mt-2 items-center justify-between gap-4">
          <AppLogo />
          <SearchBar />
        </SidebarHeader>
        <MainNav />
        <Separator />
        <UtilityNav />
        <SidebarFooter className="md:hidden">
          <SidebarMenu>
            <SidebarMenuItem>
              <ProfileSidebarTrigger />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  )
}