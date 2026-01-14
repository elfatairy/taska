'use client';

import { EllipsisVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger } from "@/common/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/common/components/ui/sidebar";
import { ProfileDropdownContent } from "@/features/profile/components/profile-dropdown/ProfileDropdownContent";
import { useUser } from "@clerk/nextjs";
import ProfilePlaceholderIcon from "@/common/components/ProfilePlaceholderIcon";

export default function ProfileSidebarTrigger({ className }: { className?: string }) {
  const { user } = useUser();

  if (!user) return <ProfilePlaceholderIcon />;

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton>
            <Avatar className="h-9 w-9 rounded-lg">
              <AvatarImage src={user.imageUrl} alt={user.fullName ?? ""} />
              <AvatarFallback className="rounded-lg">{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.fullName}</span>
              <span className="text-muted-foreground truncate text-xs">
                {user.primaryEmailAddress?.emailAddress}
              </span>
            </div>
            <EllipsisVertical className="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        
        <ProfileDropdownContent />
      </DropdownMenu>
    </div>
  )
}
