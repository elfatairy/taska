"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Doc } from "@convex/_generated/dataModel"
import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { getProjectIcon } from "../utils/getProjectIcon"
import { Icon } from "@/components/Icon"
import { getStatusBadgeVariant, formatStatusText } from "../utils/projectStatus"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatDuration } from "../utils/formatDuration"
import { ProjectsTableActions } from "./ProjectsTableActions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ProjectId } from "../types"

export type Project = Doc<"projects"> & { productManager: Doc<"users"> | null }

export const projectsTableColumns: ColumnDef<Project>[] = [
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
        <Link href={`/dashboard/manage/users/${project.productManager.profile_slug}`} className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Avatar>
            <AvatarImage src={project.productManager.imageUrl} alt={project.productManager.name} />
            <AvatarFallback>{project.productManager.name.split(" ").map(name => name[0]).join("")}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-medium">{project.productManager.name}</p>
            <p className="text-xs text-muted-foreground">{project.productManager.email}</p>
          </div>
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