'use client';

import AppLogo from "@/components/AppLogo";
import { Icon } from "@/components/Icon";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import NotificationTrigger from "@/features/notifications/NotificationTrigger";
import ProfileHeaderTrigger from "@/features/profile/HeaderTrigger";

export function DashboardHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 w-full px-5 h-(--header-height) flex justify-between items-center bg-card border-b border-border">
      <div className="flex items-center gap-8">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
          <Icon icon='Menu' />
        </Button>
        <AppLogo className="hidden md:block" />
        <SearchBar className="hidden md:block" />
      </div>
      <div className="flex items-center gap-4">
        <NotificationTrigger />
        <ProfileHeaderTrigger className="hidden md:flex" />
      </div>
    </header>
  )
}