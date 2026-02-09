"use client"

import { Task, TaskId, TeamId } from "@/common/types";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/common/components/ui/table";
import { ColumnDef, flexRender, type Table as TableType } from "@tanstack/react-table";
import { toast } from "sonner";
import { Button } from "@/common/components/ui/button";
import { PlusIcon, ListTodoIcon } from "lucide-react";
import { Empty, EmptyContent, EmptyTitle, EmptyDescription, EmptyHeader, EmptyMedia } from "@/common/components/ui/empty";

export function ProjectBacklogTable({
  table,
  columns,
  teamId,
  handleOpenNewTaskDialog
}: {
  table: TableType<Task>,
  columns: ColumnDef<Task>[],
  teamId: TeamId | null
  handleOpenNewTaskDialog: () => void
}) {
  function openTask(taskId: TaskId) {
    toast.info(`Opening task ${taskId}`);
  }
  return (
    <Table>
      <TableHeader className="border-t">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
              className="cursor-pointer"
              onClick={() => openTask(row.original._id)}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center">
              <EmptyBacklog teamId={teamId} handleOpenNewTaskDialog={handleOpenNewTaskDialog} />
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}


function EmptyBacklog({ teamId, handleOpenNewTaskDialog }: { teamId: TeamId | null, handleOpenNewTaskDialog: () => void }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ListTodoIcon />
        </EmptyMedia>
        <EmptyTitle>
          {teamId ? "No backlog tasks for this team" : "Your backlog is empty"}
        </EmptyTitle>
        <EmptyDescription>
          {teamId 
            ? "This team doesn't have any backlog tasks yet. Create your first task to get started."
            : "Backlog tasks are items waiting to be planned. Create a task to add it to your backlog and organize your work."
          }
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={handleOpenNewTaskDialog}>
          <PlusIcon className="w-4 h-4" />
          Create First Task
        </Button>
      </EmptyContent>
    </Empty>
  )
}