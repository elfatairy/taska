import { useAccountMutation, useAccountQuery } from "@/common/hooks/useAccount";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import { Button } from "@/common/components/ui/button";
import { Check, Copy, MoreHorizontal, PlusIcon } from "lucide-react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/common/components/ui/dropdown-menu";
import type { TeamMemberDetail } from "@/features/team/types";
import type { TeamId } from "@/common/types";
import { CopyCopied, CopyToClipboard } from "@/common/components/ui/copy";
import { CopyUncopied } from "@/common/components/ui/copy";
import { TeamDetailsMembersCardSkeleton } from "@/features/team/components/team-details/TeamDetailsSkeleton";
import { useWithLoading } from "@/common/hooks/useWithLoading";
import { toast } from "sonner";
import { AssignMembersDialog, useShouldOpenAssignMembersDialog } from "@/features/team/components/team-members/AssignMembersDialog";
import { useState } from "react";
import { isFailure } from "@convex/utils/types";
import { useUserRole } from "@/common/hooks/useUserRole";
import { UserSummary } from "@/common/components/UserSummary";

export function TeamDetailsMembersCard({ teamId }: { teamId: TeamId }) {
  const initialOpenAssignMembersDialog = useShouldOpenAssignMembersDialog(teamId);
  const [openAssignMembersDialog, setOpenAssignMembersDialog] = useState(initialOpenAssignMembersDialog);
  const teamMembersQuery = useAccountQuery(api.team.getTeamMembers, {
    teamId,
  });
  const userRole = useUserRole();

  if (!teamMembersQuery) {
    return <TeamDetailsMembersCardSkeleton />
  }

  if (teamMembersQuery.error) {
    return <div>Error: {teamMembersQuery.error}</div>
  }

  const teamMembers = teamMembersQuery.data;

  return (
    <>
      <AssignMembersDialog
        open={openAssignMembersDialog}
        onClose={() => setOpenAssignMembersDialog(false)}
        teamId={teamId}
      />
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>View and manage all members in this team</CardDescription>
          {userRole === "CTO" && (
            <CardAction>
              <Button
                variant="ghost" size="sm" className="text-xs border border-slate-300"
                onClick={() => setOpenAssignMembersDialog(true)}
              >
                <PlusIcon className="w-3 h-3 mr-1" />
                Add Member
              </Button>
            </CardAction>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            {teamMembers.length > 0 ? teamMembers.map((member) => (
              <TeamDetailsMemberItem key={member._id} member={member} />
            )) : (
              <div className="flex items-center justify-center p-4 text-muted-foreground">
                No members in this team yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function TeamDetailsMemberItem({ member }: { member: TeamMemberDetail }) {
  const unassignFromTeamMutation = useAccountMutation(api.team.removeTeamMember);
  const changeTeamLeadMutation = useAccountMutation(api.team.changeTeamLead);
  const { isLoading: isUnassigningLoading, runWithLoading: runWithUnassigningLoading } = useWithLoading();
  const { isLoading: isUpdatingLoading, runWithLoading: runWithUpdatingLoading } = useWithLoading();
  const userRole = useUserRole();

  const handleUnassign = () => {
    runWithUnassigningLoading(async () => {
      const unassignFromTeamResult = await unassignFromTeamMutation({
        teamId: member.teamId,
        userId: member.userId
      });
      if (isFailure(unassignFromTeamResult)) {
        toast.error(unassignFromTeamResult.error);
        return;
      }
    });
  };

  const ChangeTeamLead = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    runWithUpdatingLoading(async () => {
      await changeTeamLeadMutation({
        teamId: member.teamId,
        teamLeadId: member.userId
      });

      toast.success("Team lead changed successfully"); // TODO: Change this to button success state
    });
  };

  return (
    <div key={member._id} className="flex items-center justify-between gap-2 p-2 hover:bg-slate-100 rounded-md transition-colors">
      <UserSummary user={member.user} size="lg" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex justify-end w-full">
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-3xs">
          <CopyMemberIdDropdownMenuItem memberId={member._id} />
          {
            userRole === "CTO" && (
              <>
                <DropdownMenuSeparator />
                <Link href={`/dashboard/manage/users/${member.user.profile_slug}`} className="w-full h-full">
                  <DropdownMenuItem>View user</DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={ChangeTeamLead}>
                  {isUpdatingLoading ? "Promoting..." : "Promote to team lead"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleUnassign}>
                  {isUnassigningLoading ? "Removing..." : "Remove from team"}
                </DropdownMenuItem>
              </>
            )
          }
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

const CopyMemberIdDropdownMenuItem = ({ memberId }: { memberId: string }) => {
  return (
    <CopyToClipboard textToCopy={memberId} className="w-full h-full">
      <DropdownMenuItem onClick={(e) => e.preventDefault()}>
        <CopyUncopied>
          <span className="flex items-center gap-2">
            <Copy className="h-2 w-2 text-foreground" />
            Copy member ID
          </span>
        </CopyUncopied>
        <CopyCopied>
          <div className="flex items-center gap-2">
            <Check className="h-2 w-2 text-foreground" />
            Copied
          </div>
        </CopyCopied>
      </DropdownMenuItem>
    </CopyToClipboard>
  )
}