import { useAccountMutation, useAccountQuery } from "@/common/hooks/useAccount";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import { Button } from "@/common/components/ui/button";
import { Check, Copy, MoreHorizontal, PlusIcon } from "lucide-react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/common/components/ui/dropdown-menu";
import type { TeamProjectDetail } from "@/features/team/types";
import type { TeamId } from "@/common/types";
import { CopyCopied, CopyToClipboard } from "@/common/components/ui/copy";
import { CopyUncopied } from "@/common/components/ui/copy";
import { getProjectIcon } from "@/features/project/utils";
import { Icon } from "@/common/components/Icon";
import { TeamDetailsProjectsCardSkeleton } from "@/features/team/components/team-details/TeamDetailsSkeleton";
import { TeamAssignToProjectDialog, useShouldOpenAssignToProjectDialog } from "@/features/team/components/team-projects/TeamAssignToProjectDialog";
import { useWithLoading } from "@/common/hooks/useWithLoading";
import { useState } from "react";
import { Badge } from "@/common/components/ui/badge";
import { useUserRole } from "@/common/hooks/useUserRole";

export function TeamDetailsProjectsCard({ teamId }: { teamId: TeamId }) {
  const initialOpenAssignToProjectDialog = useShouldOpenAssignToProjectDialog([teamId]);
  const [openAssignToProjectDialog, setOpenAssignToProjectDialog] = useState(initialOpenAssignToProjectDialog);
  const teamProjectsQuery = useAccountQuery(api.team.getTeamProjects, {
    teamId,
  });
  const userRole = useUserRole();

  if (!teamProjectsQuery) {
    return <TeamDetailsProjectsCardSkeleton />
  }

  if (teamProjectsQuery.error) {
    return <div>Error: {teamProjectsQuery.error}</div>
  }

  const teamProjects = teamProjectsQuery.data;

  return (
    <>
      <TeamAssignToProjectDialog
        open={openAssignToProjectDialog}
        onClose={() => setOpenAssignToProjectDialog(false)}
        teamsIds={[teamId]}
      />
      <Card>
        <CardHeader>
          <CardTitle>
            Team Projects
            {
              userRole === "Product Manager" && (
                <Badge variant="outline" className="text-xs ml-2">
                  Only your projects are shown
                </Badge>
              )
            }
          </CardTitle>
          <CardDescription>All projects assigned to this team</CardDescription>
          <CardAction>
            <Button
              variant="ghost" size="sm" className="text-xs border border-slate-300"
              onClick={() => setOpenAssignToProjectDialog(true)}
            >
              <PlusIcon className="w-3 h-3 mr-1" />
              Assign Project
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            {teamProjects.length > 0 ? teamProjects.map((teamProject) => (
              <TeamDetailsProjectItem key={teamProject._id} teamProject={teamProject} teamId={teamId} />
            )) : (
              <div className="flex items-center justify-center p-4 text-muted-foreground">
                No projects assigned to this team yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function TeamDetailsProjectItem({ teamProject, teamId }: { teamProject: TeamProjectDetail, teamId: TeamId }) {
  const unassignFromProjectMutation = useAccountMutation(api.team.unassignTeamsFromProject);
  const { isLoading: isUnassigningLoading, runWithLoading: runWithUnassigningLoading } = useWithLoading();

  const handleUnassign = () => {
    runWithUnassigningLoading(async () => {
      await unassignFromProjectMutation({
        teamsIds: [teamId],
        projectId: teamProject.project_id
      });
    });
  };

  return (
    <div className="flex items-center justify-between gap-2 p-2 hover:bg-slate-100 rounded-md transition-colors">
      <div className="flex items-center gap-2">
        <Icon icon={getProjectIcon(teamProject.project.type)} size={20} />
        <div className="flex flex-col">
          <p className="text-base font-medium">{teamProject.project.name}</p>
          <p className="text-sm text-muted-foreground line-clamp-1">{teamProject.project.description}</p>
        </div>
      </div>

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
          <CopyProjectIdDropdownMenuItem projectId={teamProject.project_id} />
          <DropdownMenuSeparator />
          <Link href={`/dashboard/projects/${teamProject.project.slug}`} className="w-full h-full">
            <DropdownMenuItem>View project</DropdownMenuItem>
          </Link>
          <DropdownMenuItem onClick={handleUnassign}>
            {isUnassigningLoading ? "Unassigning..." : "Unassign from team"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function CopyProjectIdDropdownMenuItem({ projectId }: { projectId: string }) {
  return (
    <CopyToClipboard textToCopy={projectId} className="w-full h-full">
      <DropdownMenuItem onClick={(e) => e.preventDefault()}>
        <CopyUncopied>
          <span className="flex items-center gap-2">
            <Copy className="h-2 w-2 text-foreground" />
            Copy project ID
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