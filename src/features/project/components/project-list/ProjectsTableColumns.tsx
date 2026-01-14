"use client"

import { Badge } from "@/common/components/ui/badge"
import { cn } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { getProjectIcon, getStatusBadgeVariant, formatStatusText, formatDuration } from "@/features/project/utils"
import { Icon } from "@/common/components/Icon"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/common/components/ui/tooltip"
import { ProjectsTableActions } from "@/features/project/components/project-list/ProjectsTableActions"
import { ProjectId, ProjectWithManager } from "@/common/types"
import { UserSummary } from "@/common/components/UserSummary"

export const projectsTableColumns: ColumnDef<ProjectWithManager>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const project = row.original
      return (
        <div className="flex items-center gap-2">
          <Icon icon={getProjectIcon(project.type)} size={20} />
          <div className="text-sm font-medium flex items-baseline gap-2 ">
            <span className="text-sm font-medium">{project.name}</span>
            <span className="text-xs text-muted-foreground">{project.key}</span>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const project = row.original
      return <p className="text-sm max-w-xs text-wrap line-clamp-3">{project.description}</p>
    }
  },
  {
    accessorKey: "productManager",
    header: "Product Manager",
    cell: ({ row }) => {
      const project = row.original
      if (!project.productManager) {
        return <p className="text-sm font-medium">Unassigned</p>
      }
      return (
        <Link
          href={`/dashboard/manage/users/${project.productManager.profile_slug}`}
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <UserSummary user={project.productManager} />
        </Link>
      )
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const project = row.original
      const { variant, className } = getStatusBadgeVariant(project.status)

      if (project.status === 'completed') {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant={variant} className={cn(className, "font-medium")}>
                {formatStatusText(project.status)}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">Completed at {project.completed_date ? new Date(project.completed_date).toLocaleDateString() : "N/A"}</p>
            </TooltipContent>
          </Tooltip>
        )
      }

      return <Badge variant={variant} className={cn(className, "font-medium")}>
        {formatStatusText(project.status)}
      </Badge>
    }
  },
  {
    accessorKey: "start_date",
    header: "Start Date",
    cell: ({ row }) => {
      const project = row.original
      return <p className="text-sm text-muted-foreground">{project.start_date ? new Date(project.start_date).toLocaleDateString() : "N/A"}</p>
    }
  },
  {
    accessorKey: "target_date",
    header: "Target Date",
    cell: ({ row }) => {
      const project = row.original
      const overdueBy = project.target_date ? new Date().getTime() - new Date(project.target_date).getTime() : 0
      const overdue = ['in_progress', 'on_hold', 'draft'].includes(project.status) && project.target_date && overdueBy >= 0

      if (overdue) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className={cn("text-sm text-red-500 p-1/2 rounded-md bg-red-500/10 border border-red-500/20 text-center")}>
                {project.target_date ? new Date(project.target_date).toLocaleDateString() : "N/A"}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">Overdue by {formatDuration(overdueBy)}</p>
            </TooltipContent>
          </Tooltip>
        )
      }

      return <p className="text-sm text-muted-foreground">{project.target_date ? new Date(project.target_date).toLocaleDateString() : "N/A"}</p>
    }
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const project = row.original
      const meta = table.options.meta as {
        handleOpenProjectAssignTeamsDialog: (projectId: ProjectId) => void;
      }
      return <ProjectsTableActions
        project={project}
        handleOpenProjectAssignTeamsDialog={() => meta.handleOpenProjectAssignTeamsDialog(project._id)}
      />
    }
  },
]