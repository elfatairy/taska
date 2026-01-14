import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { CheckCircle2, Circle, Search, X } from "lucide-react"
import { DialogDescription } from "@radix-ui/react-dialog"
import { useAccountMutation, useAccountQuery } from "@/features/account/useAccount"
import { api } from "@convex/_generated/api"
import { useState, useEffect, useEffectEvent } from "react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Doc } from "@convex/_generated/dataModel"
import { useSearchParams } from "next/navigation"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { useWithLoading } from "@/hooks/useWithLoading"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { TeamId } from "@/common/types"

export function useShouldOpenAssignMembersDialog(teamId?: TeamId) {
  const searchParams = useSearchParams();
  return searchParams.get("modal") === "assign-members" && (!teamId || searchParams.get("teamId") === teamId);
}

export function AssignMembersDialog({ open, onClose, teamId }: { open: boolean, onClose: () => void, teamId: TeamId }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClose = () => {
    onClose();
    setTimeout(() => setShowSuccess(false), 3000);
    handleUrlParams(false);
  };

  const handleUrlParams = (isOpen: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (isOpen) {
      params.set("modal", "assign-members");
      params.set("teamId", teamId);
    } else {
      params.delete("modal");
      params.delete("teamId");
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
      setShowSuccess(false);
    }
    handleUrlParams(isOpen);
  };

  const handleUrlParamsEffect = useEffectEvent(handleUrlParams);
  useEffect(() => {
    if (open) handleUrlParamsEffect(true);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="md:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Assign Members</DialogTitle>
          <DialogDescription>Select members to assign to the team</DialogDescription>
        </DialogHeader>

        {showSuccess ? (
          <AssignMembersDialogSuccessState onClose={handleClose} />
        ) : (
          <AssignMembersDialogContent
            teamId={teamId}
            onSuccess={() => setShowSuccess(true)}
            onCancel={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function AssignMembersDialogContent({ teamId, onSuccess, onCancel }: { teamId: TeamId, onSuccess: () => void, onCancel: () => void }) {
  const usersQuery = useAccountQuery(api.user.getUsers);
  const teamMembersQuery = useAccountQuery(api.team.getTeamMembers, {
    teamId: teamId,
  });
  const assignMembersMutation = useAccountMutation(api.team.assignMembersToTeam);
  const { isLoading: isSaving, runWithLoading: runWithSaving } = useWithLoading();
  const [searchValue, setSearchValue] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  if (!usersQuery || !teamMembersQuery) {
    return <AssignMembersDialogContentSkeleton />;
  }

  if (usersQuery.error || teamMembersQuery.error) {
    return <div>Error: {usersQuery.error}</div>; // TODO: Make ui better
  }

  const users = usersQuery.data;
  const teamMembers = teamMembersQuery.data;

  let filteredUsers = users.filter((user) => !['CTO', 'Product Manager'].includes(user.role));
  filteredUsers = [
    ...filteredUsers.filter((user) => user.name.toLowerCase().includes(searchValue.toLowerCase())),
    ...filteredUsers.filter((user) => (user.email + user.role).toLowerCase().includes(searchValue.toLowerCase()) && !user.name.toLowerCase().includes(searchValue.toLowerCase()))
  ]

  const handleSave = () => {
    runWithSaving(async () => {
      const result = await assignMembersMutation({
        teamId: teamId,
        membersIds: selectedMembers,
      });
      if (result.error) {
        toast.error(`Failed to assign members: ${result.error}`); // TODO: Show a proper error ui
      } else {
        onSuccess();
      }
    });
  };

  return (
    <>
      <div className="flex flex-col gap-2 my-4">
        <Input
          type="text"
          placeholder="Search for a user"
          onChange={(e) => setSearchValue(e.target.value)}
          icon={Search}
          iconProps={{ behavior: 'prepend' }}
        />

        <div className="flex flex-col gap-3">
          {selectedMembers.length > 0 && (
            <SelectedMembersList
              selectedMembers={selectedMembers}
              users={users}
              removeMember={(member) => setSelectedMembers(selectedMembers.filter((m) => m !== member))}
            />
          )}

          {filteredUsers.length > 0 ? (
            <div className="flex flex-col max-h-[350px] overflow-y-auto gap-1">
              {filteredUsers.map((user) => (
                <UsersListItem
                  key={user._id}
                  user={user}
                  selectedMembers={selectedMembers}
                  teamMembers={teamMembers}
                  addMember={() => setSelectedMembers([...selectedMembers, user._id])}
                  removeMember={() => setSelectedMembers(selectedMembers.filter((member) => member !== user._id))}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching your search
            </div>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </>
  )
}

function SelectedMembersList({ selectedMembers, users, removeMember }: { selectedMembers: string[], users: Doc<"users">[], removeMember: (member: string) => void }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-md">
      <span className="text-sm font-medium text-green-900 dark:text-green-100 shrink-0">
        Selected ({selectedMembers.length}):
      </span>
      {selectedMembers.map((member) => {
        const user = users.find((user) => user._id === member);
        if (!user) return null;

        return (
          <div
            key={member}
            className={"flex items-center shrink-0 gap-1.5 rounded-full pl-2 pr-1 py-1 shadow-sm bg-white dark:bg-green-950/50 border border-green-300 dark:border-green-800"}
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={user.imageUrl} />
              <AvatarFallback className="text-xs">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col shrink-0">
              <p className="text-xs font-medium">{user.name}</p>
            </div>
            <button
              onClick={() => removeMember(member)}
              type="button"
              className="h-4 w-4 rounded-full hover:bg-red-100 flex items-center justify-center transition-colors"
              aria-label={`Remove ${user.name}`}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <X className="h-3 w-3 text-red-950" />
                </TooltipTrigger>
                <TooltipContent>
                  Remove {user.name} from the team
                </TooltipContent>
              </Tooltip>
            </button>
          </div>
        )
      })}
    </div>
  )
}

function UsersListItem({ user, selectedMembers, teamMembers, addMember, removeMember }: { user: Doc<"users">, selectedMembers: string[], teamMembers: Doc<"team_members">[], addMember: () => void, removeMember: () => void }) {
  const isMember = selectedMembers.includes(user._id);
  const isTeamMember = teamMembers.some((member) => member.userId === user._id);

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-md px-2 py-1 group border transition-colors",
        isTeamMember
          ? "opacity-70 cursor-not-allowed border-muted bg-muted/60 dark:bg-muted/40"
          : isMember
            ? "bg-green-50 border-green-500 hover:bg-green-100 dark:bg-green-950/30 dark:border-green-700 dark:hover:bg-green-950/50 cursor-pointer"
            : "border-transparent hover:bg-accent cursor-pointer"
      )}
      onClick={() => !isTeamMember && (isMember ? removeMember() : addMember())}
    >
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarImage src={user.imageUrl} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{user.name}</p>
            <Badge variant="secondary" className="capitalize">
              {user.role}
            </Badge>
            {isTeamMember && (
              <Badge variant="outline" className="text-xs">
                Already member
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {isTeamMember ? (
        <CheckCircle2 className="h-5 w-5 text-muted-foreground/40" />
      ) : isMember ? (
        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
      ) : (
        <Circle className="h-5 w-5 text-muted-foreground/40" />
      )}
    </div>
  )
}

function AssignMembersDialogContentSkeleton() {
  return (
    <>
      <div className="flex flex-col gap-2 my-4">
        {/* Search input skeleton */}
        <Skeleton className="h-10 w-full" />

        <div className="flex flex-col gap-3">
          {/* Users list skeleton */}
          <div className="flex flex-col max-h-[350px] overflow-y-auto gap-1">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div key={index} className="flex items-center justify-between gap-2 rounded-md px-2 py-1 border border-transparent">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </DialogFooter>
    </>
  )
}

function AssignMembersDialogSuccessState({ onClose }: { onClose: () => void }) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) {
      onClose();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onClose]);

  return (
    <div className="flex flex-col items-center text-center py-6 gap-4">
      <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Members Assigned Successfully!</h3>
        <p className="text-sm text-muted-foreground">
          Closing in {countdown} second{countdown !== 1 ? 's' : ''}...
        </p>
      </div>
      <Button onClick={onClose} variant="outline" className="mt-2">
        Close Now
      </Button>
    </div>
  );
}