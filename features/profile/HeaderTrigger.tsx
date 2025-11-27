'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ProfileDropdownContent } from "@/features/profile/components/DropdownContent";
import { useUser } from "@clerk/nextjs";
import PlaceholderProfileIcon from "./components/PlaceholderProfileIcon";

export default function ProfileHeaderTrigger({ className }: { className?: string }) {
  const { user } = useUser();

  if (!user) return <PlaceholderProfileIcon />;

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="cursor-pointer p-0" variant="ghost" size="icon">
            <Avatar className="h-9 w-9 rounded-lg">
              <AvatarImage src={user.imageUrl} alt={user.fullName ?? ""} />
              <AvatarFallback className="rounded-lg">{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <ProfileDropdownContent />
      </DropdownMenu>
    </div>
  )
}