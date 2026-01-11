"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CopyCopied, CopyToClipboard, CopyUncopied } from "@/components/ui/copy"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { featureUnderDevelopment } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { Check, Copy, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import TeamMembersTooltip from "./TeamMembersTooltip"
import { TeamAssignToProjectDialog, TeamAssignToProjectDialogTrigger } from "./TeamAssignToProjectDialog"
import TeamProjectsTooltip from "./TeamProjectsTooltip"
import { Checkbox } from "@/components/ui/checkbox"
import type { Team } from "@/features/team/types"
import { ChangeTeamLeadDialog, ChangeTeamLeadDialogTrigger } from "./ChangeTeamLeadDialog"

export const teamsTableColumns: ColumnDef<Team>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        onClick={(e) => e.stopPropagation()}
      />
    ),
  },
  {
    accessorKey: "name",
    header: "Team Name",
    cell: ({ row }) => {
      const team = row.original

      return (
        <div className="flex flex-col">
          <p className="text-sm font-medium">{team.name}</p>
          {team.description && (
            <p className="text-xs text-muted-foreground truncate max-w-xs">{team.description}</p>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: "team_lead_id",
    header: "Team Lead",
    cell: ({ row }) => {
      const team = row.original

      if (!team.teamLead) {
        return <div className="text-sm text-muted-foreground">No team lead assigned</div>
      }

      return (
        <Link href={`/dashboard/manage/users/${team.teamLead.profile_slug}`} className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Avatar>
            <AvatarImage src={team.teamLead.imageUrl} alt={team.teamLead.name} />
            <AvatarFallback>{team.teamLead.name.split(" ").map(name => name[0]).join("")}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-medium">{team.teamLead.name}</p>
            <p className="text-xs text-muted-foreground">{team.teamLead.email}</p>
          </div>
        </Link>
      )
    }
  },
  {
    accessorKey: "memberCount",
    header: "Members",
    cell: ({ row }) => {
      const team = row.original
      return <TeamMembersTooltip team={team} />
    }
  },
  {
    accessorKey: "projectCount",
    header: "Projects",
    cell: ({ row }) => {
      const team = row.original
      return <TeamProjectsTooltip team={team} />
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const team = row.original

      // TODO: Refactor to make it more readable
      return (
        <TeamAssignToProjectDialog teamsIds={[team._id]}>
          <ChangeTeamLeadDialog teamId={team._id} initialTeamLeadId={team.team_lead_id}>
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
                <CopyToClipboard textToCopy={team._id} className="w-full h-full">
                  <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                    <CopyUncopied>
                      <span className="flex items-center gap-2">
                        <Copy className="h-2 w-2 text-foreground" />
                        Copy team ID
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
                <Link href={`/dashboard/manage/teams/${team.slug}`} className="w-full h-full">
                  <DropdownMenuItem>Manage team</DropdownMenuItem>
                </Link>
                <TeamAssignToProjectDialogTrigger>
                  <DropdownMenuItem>Assign to project</DropdownMenuItem>
                </TeamAssignToProjectDialogTrigger>
                <ChangeTeamLeadDialogTrigger>
                  <DropdownMenuItem>Change team lead</DropdownMenuItem>
                </ChangeTeamLeadDialogTrigger>
                <DropdownMenuItem
                  onClick={() => featureUnderDevelopment()}
                >Archive team</DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => featureUnderDevelopment()}
                >Delete team</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </ChangeTeamLeadDialog>
        </TeamAssignToProjectDialog>
      )
    },
  },
]
