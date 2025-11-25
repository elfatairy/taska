import { EllipsisVertical } from "lucide-react";
import { Icon } from "@/components/Icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { ProfileDropdownContent } from "@/features/profile/components/DropdownContent";

export default function ProfileSidebarTrigger({ className }: { className?: string }) {
  const user = {
    avatar: "https://github.com/shadcn.png",
    name: "John Doe",
    email: "john.doe@example.com"
  }

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton>
            <Avatar className="h-9 w-9 rounded-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-lg">{user.name.charAt(0)}{user.name.split(' ')[1]?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="text-muted-foreground truncate text-xs">
                {user.email}
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

function PlaceholderProfileIcon() {
  return (
    <div
      className="flex items-center justify-center bg-muted text-muted-foreground rounded-full w-9 h-9"
      aria-label="Open Profile Menu"
    >
      <Icon icon='Profile' className="w-4 h-4" aria-hidden="true" />
    </div>
  )
}