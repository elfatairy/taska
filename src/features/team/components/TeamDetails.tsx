import { useAccountQuery } from "@/features/account/useAccount";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Copy, MoreHorizontal, PlusIcon } from "lucide-react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Team, TeamLead, TeamMember, TeamProject } from "@/features/team/types";
import { CopyCopied, CopyToClipboard } from "@/components/ui/copy";
import { CopyUncopied } from "@/components/ui/copy";
import { featureUnderDevelopment } from "@/lib/utils";
import { getProjectIcon } from "@/features/project/utils/getProjectIcon";
import { Icon } from "@/components/Icon";
import { TeamDetailsLoading, TeamDetailsMembersCardLoading, TeamDetailsProjectsCardLoading } from "./TeamDetailsLoading";

export function TeamDetails({ teamSlug }: { teamSlug: string }) {
  const teamQuery = useAccountQuery(api.team.getTeamBySlug, {
    teamSlug,
  });

  if (!teamQuery) {
    return <TeamDetailsLoading />
  }

  if (teamQuery.error) {
    return <div>Error: {teamQuery.error}</div>
  }

  const team = teamQuery.data;

  return (
    <div className="flex gap-4">
      <div className="flex flex-7 flex-col gap-4">
        <TeamDetailsMembersCard teamId={team._id} />
        <TeamDetailsProjectsCard teamId={team._id} />
      </div>

      <div className="flex flex-3 flex-col gap-4">
        <TeamDetailsAboutCard description={team.description} teamLead={team.teamLead} />
        <TeamDetailsStatsCard team={team} />
      </div>
    </div>
  )
}

function TeamDetailsMembersCard({ teamId }: { teamId: Team['_id'] }) {
  const teamMembersQuery = useAccountQuery(api.team.getTeamMembers, {
    teamId,
  });

  if (!teamMembersQuery) {
    return <TeamDetailsMembersCardLoading />
  }

  if (teamMembersQuery.error) {
    return <div>Error: {teamMembersQuery.error}</div>
  }

  const teamMembers = teamMembersQuery.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        <CardDescription>View and manage all members in this team</CardDescription>
        <CardAction>
          <Button
            variant="ghost" size="sm" className="text-xs border border-slate-300"
            onClick={() => featureUnderDevelopment()}
          >
            <PlusIcon className="w-3 h-3 mr-1" />
            Add Member
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          {teamMembers.map((member) => (
            <TeamDetailsMemberItem key={member._id} member={member} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function TeamDetailsMemberItem({ member }: { member: TeamMember }) {
  return (
    <div key={member._id} className="flex items-center justify-between gap-2 p-2 hover:bg-slate-100 rounded-md transition-colors">
      <div className="flex items-center gap-2">
        <Avatar className="size-10">
          <AvatarImage src={member.user.imageUrl} alt={member.user.name} />
          <AvatarFallback>{member.user.name.split(" ").map(name => name[0]).join("")}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="text-base font-medium">{member.user.name}</p>
          <p className="text-sm text-muted-foreground">{member.user.email}</p>
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
          <CopyToClipboard textToCopy={member._id} className="w-full h-full">
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
          <DropdownMenuSeparator />
          <Link href={`/dashboard/manage/users/${member.user.profile_slug}`} className="w-full h-full">
            <DropdownMenuItem>View user</DropdownMenuItem>
          </Link>
          <DropdownMenuItem onClick={() => featureUnderDevelopment()}>
            Promote to team lead
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => featureUnderDevelopment()}>
            Remove from team
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function TeamDetailsProjectsCard({ teamId }: { teamId: Team['_id'] }) {
  const teamProjectsQuery = useAccountQuery(api.team.getTeamProjects, {
    teamId,
  });

  if (!teamProjectsQuery) {
    return <TeamDetailsProjectsCardLoading />
  }

  if (teamProjectsQuery.error) {
    return <div>Error: {teamProjectsQuery.error}</div>
  }

  const teamProjects = teamProjectsQuery.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Projects</CardTitle>
        <CardDescription>All projects assigned to this team</CardDescription>
        <CardAction>
          <Button
            variant="ghost" size="sm" className="text-xs border border-slate-300"
            onClick={() => featureUnderDevelopment()}
          >
            <PlusIcon className="w-3 h-3 mr-1" />
            Assign Project
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          {teamProjects.map((project) => (
            <TeamDetailsProjectItem key={project._id} project={project} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function TeamDetailsProjectItem({ project }: { project: TeamProject }) {
  return (
    <div className="flex items-center justify-between gap-2 p-2 hover:bg-slate-100 rounded-md transition-colors">
      <div className="flex items-center gap-2">
        <Icon icon={getProjectIcon(project.project.type)} size={20} />
        <div className="flex flex-col">
          <p className="text-base font-medium">{project.project.name}</p>
          <p className="text-sm text-muted-foreground line-clamp-1">{project.project.description}</p>
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
          <CopyToClipboard textToCopy={project._id} className="w-full h-full">
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
          <DropdownMenuSeparator />
          <Link href={`/dashboard/projects/${project.project.slug}`} className="w-full h-full">
            <DropdownMenuItem>View project</DropdownMenuItem>
          </Link>
          <DropdownMenuItem onClick={() => featureUnderDevelopment()}>
            Unassign from team
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function TeamDetailsAboutCard({ description, teamLead }: { description: string, teamLead: TeamLead | null }) {
  return (
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
                <Avatar>
                  <AvatarImage src={teamLead.imageUrl} alt={teamLead.name} />
                  <AvatarFallback>{teamLead.name.split(" ").map(name => name[0]).join("")}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{teamLead.name}</p>
                  <p className="text-xs text-muted-foreground">{teamLead.email}</p>
                </div>
              </Link>
            )}
            {!teamLead && (
              <p className="text-sm text-muted-foreground mb-2">No team lead assigned</p>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => featureUnderDevelopment()}
            >
              {
                teamLead ? (
                  <Icon icon="Swap" size={16} className="w-3 h-3 mr-1" />
                ) : (
                  <PlusIcon className="w-3 h-3 mr-1" />
                )
              }
              { teamLead ? "Change Team Lead" : "Assign Team Lead" }
            </Button>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground pb-1">Description</h3>
            <p className="text-sm leading-relaxed">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TeamDetailsStatsCard({ team }: { team: Team }) {
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