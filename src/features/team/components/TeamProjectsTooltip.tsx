"use client"

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAccountQuery } from "@/features/account/useAccount";
import type { Team } from "@/features/team/components/TeamsTableColumns";
import { TeamProjectsTooltipSkeleton } from "@/features/team/components/TeamProjectsTooltipSkeleton";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { getProjectIcon } from "@/features/project/utils/getProjectIcon";

export default function TeamProjectsTooltip({ team }: { team: Team }) {
  const projectCount = team.projectIds?.length || 0
  const [hasBeenOpened, setHasBeenOpened] = useState(false)

  if (projectCount === 0) {
    return <Badge variant="destructive" className="text-xs">No projects</Badge>
  }

  return (
    <Tooltip onOpenChange={(open) => {
      if (open && !hasBeenOpened) {
        setHasBeenOpened(true)
      }
    }}>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2">
          <Icon icon="DocumentReport" size={16} className="text-muted-foreground" />
          <span className="text-sm">{projectCount}</span>
        </div>
      </TooltipTrigger>
      {hasBeenOpened && <TeamProjectsTooltipContent teamId={team._id} projectCount={projectCount} />}
    </Tooltip>
  )
}

function TeamProjectsTooltipContent({ teamId, projectCount }: { teamId: Team['_id'], projectCount: number }) {
  const teamProjectsQuery = useAccountQuery(api.team.getTeamProjects, { teamId })

  const toolTipClassName = "w-80 p-2 bg-white border-gray-200 shadow-lg"
  const arrowClassName = "bg-white fill-white"

  if (!teamProjectsQuery) {
    return (
      <TooltipContent side="left" className={toolTipClassName} arrowClassName={arrowClassName}>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between border-b border-gray-200 pb-1">
            <h4 className="text-sm font-semibold text-gray-900">Team Projects</h4>
            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-100">
              {projectCount} {projectCount === 1 ? 'project' : 'projects'}
            </Badge>
          </div>
          <TeamProjectsTooltipSkeleton projectCount={projectCount} />
        </div>
      </TooltipContent>
    )
  }

  if (teamProjectsQuery.error) {
    return (
      <TooltipContent side="left" className={toolTipClassName} arrowClassName={arrowClassName}>
        <Badge variant="destructive" className="text-xs">Error Loading Team Projects</Badge>
      </TooltipContent>
    )
  }

  const teamProjects = teamProjectsQuery.data || []

  const sortedProjects = [...teamProjects].sort((a, b) => {
    const statusOrder = { 'in_progress': 0, 'draft': 1, 'completed': 2, 'on_hold': 3, 'cancelled': 4 }
    return statusOrder[a.project.status] - statusOrder[b.project.status]
  })

  return (
    <TooltipContent side="left" className={toolTipClassName} onClick={(e) => e.stopPropagation()} arrowClassName={arrowClassName}>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between border-b border-gray-200 pb-1">
          <h4 className="text-sm font-semibold text-gray-900">Team Projects</h4>
          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-100">
            {teamProjects.length} {teamProjects.length === 1 ? 'project' : 'projects'}
          </Badge>
        </div>
        <div className="space-y-1.5 max-h-96 overflow-y-auto">
          {sortedProjects.map((teamProject) => (
            <Link
              href={`/dashboard/projects/${teamProject.project.slug}`}
              key={teamProject._id}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0 flex items-center gap-3 text-gray-900">
                <Icon icon={getProjectIcon(teamProject.project.type)} size={20} />
                <div className="text-sm font-medium flex items-center gap-2.5">
                  <span className="text-sm font-medium">{teamProject.project.name}</span>
                  <Badge
                    variant={
                      teamProject.project.status === 'in_progress' ? 'default' :
                        teamProject.project.status === 'completed' ? 'secondary' :
                          'outline'
                    }
                    className="text-[10px] px-1.5 py-0 h-5 font-normal"
                  >
                    {teamProject.project.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </TooltipContent>
  )
}