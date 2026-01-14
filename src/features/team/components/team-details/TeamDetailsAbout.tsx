import { useAccountQuery } from "@/common/hooks/useAccount";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import { Button } from "@/common/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import type { User, TeamId } from "@/common/types";
import { Icon } from "@/common/components/Icon";
import { ChangeTeamLeadDialog, useShouldOpenChangeTeamLeadDialog } from "@/features/team/components/team-members/ChangeTeamLeadDialog";
import { useState } from "react";
import { useUserRole } from "@/common/hooks/useUserRole";
import { UserSummary } from "@/common/components/UserSummary";
import { TeamDetail } from "../../types";

export function TeamDetailsAboutCard({ description, teamLead, teamId }: { description: string, teamLead: User | null, teamId: TeamId }) {
  const initialOpenChangeTeamLeadDialog = useShouldOpenChangeTeamLeadDialog(teamId);
  const [openChangeTeamLeadDialog, setOpenChangeTeamLeadDialog] = useState(initialOpenChangeTeamLeadDialog);
  const teamMembersQuery = useAccountQuery(api.team.getTeamMembers, {
    teamId: teamId,
  });
  const userRole = useUserRole();

  if (teamMembersQuery?.error) {
    return <div>Error: {teamMembersQuery.error}</div> // TODO: Show a proper error ui  
  }

  return (
    <>
      <ChangeTeamLeadDialog
        open={openChangeTeamLeadDialog}
        onClose={() => setOpenChangeTeamLeadDialog(false)}
        teamId={teamId}
      />
      <Card>
        <CardHeader>
          <CardTitle>Team Information</CardTitle>
          <CardDescription>Team leadership and general information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between pb-1">
                <h3 className="text-sm font-semibold text-muted-foreground">Team Lead</h3>
              </div>
              {teamLead && (
                <Link href={`/dashboard/manage/users/${teamLead.profile_slug}`} className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-md transition-colors mb-2">
                  <UserSummary user={teamLead} />
                </Link>
              )}
              {!teamLead && (
                <p className="text-sm text-muted-foreground mb-2">No team lead assigned</p>
              )}
              {userRole === "CTO" && (
                <Button
                  variant="outline" size="sm" className="w-full text-xs"
                  onClick={() => setOpenChangeTeamLeadDialog(true)}
                >
                  {
                    teamLead ? <>
                      <Icon icon="Swap" className="w-3 h-3 mr-1" /> Change Team Lead
                    </> : <>
                      <PlusIcon className="w-3 h-3 mr-1" /> Assign Team Lead
                    </>
                  }
                </Button>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground pb-1">Description</h3>
              <p className="text-sm leading-relaxed">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export function TeamDetailsStatsCard({ team }: { team: TeamDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistics</CardTitle>
        <CardDescription>Quick overview of team metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground">Total Members</h3>
            <p className="text-sm font-medium">{team.memberIds.length}</p>
          </div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground">Total Projects</h3>
            <p className="text-sm font-medium">{team.projectIds.length}</p>
          </div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground">Created At</h3>
            <p className="text-sm font-medium">{new Date(team._creationTime).toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}