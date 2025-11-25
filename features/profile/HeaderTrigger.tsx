import { Icon } from "@/components/Icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ProfileDropdownContent } from "@/features/profile/components/DropdownContent";

export default function ProfileHeaderTrigger({ className }: { className?: string }) {
  const user = {
    avatar: "https://github.com/shadcn.png",
    name: "John Doe"
  }
  
  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="cursor-pointer p-0" variant="ghost" size="icon">
            <Avatar className="h-9 w-9 rounded-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-lg">{user.name.charAt(0)}{user.name.split(' ')[1]?.charAt(0)}</AvatarFallback>
            </Avatar>
          </Button>
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