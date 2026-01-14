"use client"

import { TeamId } from "@/common/types";
import { TeamWithMembers } from "@/common/types/team";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAccountQuery } from "@/features/account/useAccount";
import { TeamMembersTooltipSkeleton } from "@/features/team/components/TeamMembersTooltipSkeleton";
import { api } from "@convex/_generated/api";
import { Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function TeamMembersTooltip({ team }: { team: TeamWithMembers }) {
  const memberCount = team.memberIds?.length || 0
  const [hasBeenOpened, setHasBeenOpened] = useState(false)

  if (memberCount === 0) {
    return <Badge variant="destructive" className="text-xs">No members</Badge>
  }

  return (
    <Tooltip onOpenChange={(open) => {
      if (open && !hasBeenOpened) {
        setHasBeenOpened(true)
      }
    }}>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{memberCount}</span>
        </div>
      </TooltipTrigger>
      {hasBeenOpened && <TeamMembersTooltipContent teamId={team._id} memberCount={memberCount} />}
    </Tooltip>
  )
}

function TeamMembersTooltipContent({ teamId, memberCount }: { teamId: TeamId, memberCount: number }) {
  const teamMembersQuery = useAccountQuery(api.team.getTeamMembers, { teamId })

  const toolTipClassName = "w-80 p-2 bg-white border-gray-200 shadow-lg"
  const arrowClassName = "bg-white fill-white"

  if (!teamMembersQuery) {
    return (
      <TooltipContent side="left" className={toolTipClassName} arrowClassName={arrowClassName}>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between border-b border-gray-200 pb-1">
            <h4 className="text-sm font-semibold text-gray-900">Team Members</h4>
            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-100">
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </Badge>
          </div>
          <TeamMembersTooltipSkeleton memberCount={memberCount} />
        </div>
      </TooltipContent>
    )
  }

  if (teamMembersQuery.error) {
    return (
      <TooltipContent side="left" className={toolTipClassName} arrowClassName={arrowClassName}>
        <Badge variant="destructive" className="text-xs">Error Loading Team Members</Badge>
      </TooltipContent>
    )
  }

  const teamMembers = teamMembersQuery.data || []

  const sortedMembers = [...teamMembers].sort((a, b) => {
    if (a.role === 'team_lead' && b.role !== 'team_lead') return -1
    if (a.role !== 'team_lead' && b.role === 'team_lead') return 1
    return 0
  })

  return (
    <TooltipContent side="left" className={toolTipClassName} onClick={(e) => e.stopPropagation()} arrowClassName={arrowClassName}>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between border-b border-gray-200 pb-1">
          <h4 className="text-sm font-semibold text-gray-900">Team Members</h4>
          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-100">
            {teamMembers.length} {teamMembers.length === 1 ? 'member' : 'members'}
          </Badge>
        </div>
        <div className="space-y-0.5 max-h-96 overflow-y-auto">
          {sortedMembers.map((member) => (
            <Link
              href={`/dashboard/manage/users/${member.user.profile_slug}`}
              key={member._id}
              className="flex items-center gap-2 p-1 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Avatar className="h-8 w-8 border-2 border-gray-200">
                <AvatarImage src={member.user.imageUrl} alt={member.user.name} />
                <AvatarFallback className="text-xs">
                  {member.user.name.split(" ").map(name => name[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate">{member.user.name}</p>
                  {member.role === 'team_lead' && (
                    <Badge variant="default" className="text-[10px] px-1.5 py-0 h-5 bg-blue-500 hover:bg-blue-500 text-white">
                      Team Lead
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal border-gray-300 text-gray-600 bg-white">
                    {member.user.role}
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