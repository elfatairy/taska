"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ProjectId, Task, TaskId } from "@/common/types"
import { formatTimestamp } from "@/lib/utils"
import { Badge } from "@/common/components/ui/badge"
import { formatPriorityText, formatStatusText } from "../../utils"
import { ProjectBacklogTableActions } from "./ProjectBacklogTableActions"

const getPriorityVariant = (priority: string) => {
  switch (priority.toLowerCase()) {
    case "urgent":
    case "high":
      return "destructive"
    case "medium":
      return "default"
    case "low":
      return "secondary"
    default:
      return "outline"
  }
}

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "done":
    case "completed":
      return "secondary"
    case "in progress":
    case "in_progress":
      return "default"
    case "blocked":
      return "destructive"
    case "todo":
    case "backlog":
      return "outline"
    default:
      return "outline"
  }
}

export const projectBacklogTableColumns: ColumnDef<Task>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const task = row.original
      return <p className="text-sm font-medium">{task.title}</p>
    }
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const task = row.original
      const priority = task.priority || "None"
      return (
        <Badge variant={getPriorityVariant(priority)}>
          {formatPriorityText(priority)}
        </Badge>
      )
    }
  },
  {
    accessorKey: "ready",
    header: "Is Ready",
    cell: ({ row }) => {
      const task = row.original
      const status = task.status || "None"
      return (
        <Badge variant={getStatusVariant(status)}>
          {formatStatusText(status)}
        </Badge>
      )
    }
  },
  {
    accessorKey: "estimate",
    header: "Estimate",
    cell: ({ row }) => {
      const task = row.original
      return <p className="text-sm font-normal">{task.estimate} pts</p>
    }
  },
  {
    accessorKey: "team_id",
    enableHiding: true,
  },
  {
    accessorKey: "last_updated",
    header: "Last Updated",
    cell: ({ row }) => {
      const task = row.original
      return <p className="text-sm">{task.updated_at ? formatTimestamp(task.updated_at) : "N/A"}</p>
    }
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const task = row.original
      const meta = table.options.meta as {
        handleOpenTaskDialog: (taskId: TaskId) => void;
      }
      return <ProjectBacklogTableActions
        task={task}
        handleOpenTaskDialog={() => meta.handleOpenTaskDialog(task._id)}
      />
    }
  },
]