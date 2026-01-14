'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar";
import { Button } from "@/common/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger } from "@/common/components/ui/dropdown-menu";
import { ProfileDropdownContent } from "@/features/profile/components/profile-dropdown/ProfileDropdownContent";
import { useUser } from "@clerk/nextjs";
import ProfilePlaceholderIcon from "@/common/components/ProfilePlaceholderIcon";

export default function ProfileHeaderTrigger({ className }: { className?: string }) {
  const { user } = useUser();

  if (!user) return <ProfilePlaceholderIcon />;

  const initials = user.fullName?.split(" ").map(name => name[0]).join("")

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="cursor-pointer p-0" variant="ghost" size="icon">
            <Avatar className="h-9 w-9 rounded-lg">
              <AvatarImage src={user.imageUrl} alt={user.fullName ?? ""} />
              <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <ProfileDropdownContent />
      </DropdownMenu>
    </div>
  )
}
