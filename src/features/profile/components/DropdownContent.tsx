'use client';

import { BadgeCheck, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth, useUser } from "@clerk/nextjs";
import { useWithLoading } from "@/hooks/useWithLoading";
import { tryCatch } from "@/lib/try-catch";

export function ProfileDropdownContent() {
  const { isLoading, runWithLoading } = useWithLoading();
  const { user } = useUser();
  const { signOut } = useAuth();

  const handleLogout = (e: Event) => {
    e.preventDefault();

    runWithLoading(async () => {
      const { error } = await tryCatch(signOut({
        redirectUrl: "/login",
      }));

      if (error) {
        console.error("Logout error:", error);
        toast.error("Failed to log out. Please try again.");
        return;
      }
    });
  };

  if (!user) return null;

  return (
    <DropdownMenuContent
      className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
      side={"bottom"}
      align="end"
      sideOffset={4}
    >
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={user.imageUrl} alt={user.fullName ?? ""} />
            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user.fullName}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate text-xs">{user.primaryEmailAddress?.emailAddress}</span>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {user.primaryEmailAddress?.emailAddress}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </DropdownMenuLabel>

      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem onClick={() => {
          toast.info("Account is still under development");
        }}>
          <BadgeCheck />
          Account
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={handleLogout}>
        <LogOut />
        {isLoading ? "Logging out..." : "Log out"}
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
}