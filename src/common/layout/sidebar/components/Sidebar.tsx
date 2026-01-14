import AppLogo from "@/common/components/AppLogo";
import SearchBar from "@/common/components/SearchBar";
import { Sidebar as ShadcnSidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem } from "@/common/components/ui/sidebar";
import ProfileSidebarTrigger from "@/features/profile/components/profile-dropdown/ProfileSidebarTrigger";
import { SidebarNav } from "@/common/layout/sidebar/components/SidebarNav";

export function Sidebar() {
  return (
    <ShadcnSidebar className="top-(--header-height) h-[calc(100svh-var(--header-height))]">
      <SidebarContent>
        <SidebarHeader className="ml-2 md:hidden flex-row mt-2 items-center justify-between gap-4">
          <AppLogo />
          <SearchBar />
        </SidebarHeader>

        <SidebarNav />
        
        <SidebarFooter className="md:hidden">
          <SidebarMenu>
            <SidebarMenuItem>
              <ProfileSidebarTrigger />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </SidebarContent>
    </ShadcnSidebar>
  )
}