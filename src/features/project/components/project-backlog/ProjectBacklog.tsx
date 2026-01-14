"use client"

import { useAccountQuery } from "@/common/hooks/useAccount";
import { NewTaskDialog, useShouldOpenNewTaskDialog } from "@/features/task/components/task-creation/NewTaskDialog";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Button } from "@/common/components/ui/button";
import { ProjectBacklogHeader } from "@/features/project/components/project-backlog/ProjectBacklogHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { FilterIcon, PlusIcon } from "lucide-react";
import { Input } from "@/common/components/ui/input";
import { getCoreRowModel, Table, useReactTable } from "@tanstack/react-table";
import { Task } from "@/common/types/task";
import { Project } from "@/common/types";


export function ProjectBacklog({ projectSlug }: { projectSlug: string }) {
  const projectQuery = useAccountQuery(api.project.getProjectBySlug, {
    projectSlug,
  });

  if (!projectQuery) {
    return <div>Loading...</div>;
  }

  if (projectQuery.error) {
    return <div>{projectQuery.error}</div>;
  }

  return <ProjectBacklogContent project={projectQuery.data} />;
}

function ProjectBacklogContent({ project }: { project: Project }) {
  const shouldOpenNewTaskDialog = useShouldOpenNewTaskDialog({ projectId: project._id });
  const [openNewTaskDialog, setOpenNewTaskDialog] = useState(shouldOpenNewTaskDialog);
  
  const table = useReactTable({
    data: [] as Task[],
    columns: [],
    getCoreRowModel: getCoreRowModel(),
  });

  function handleOpenNewTaskDialog() {
    setOpenNewTaskDialog(true);
  }

  function handleCloseNewTaskDialog() {
    setOpenNewTaskDialog(false);
  }

  return (
    <div className="flex flex-col gap-2 p-6">
      <ProjectBacklogHeader projectSlug={project.slug} />

      <NewTaskDialog
        open={openNewTaskDialog}
        onClose={handleCloseNewTaskDialog}
        projectId={project._id}
        status="BACKLOG"
      />
      <Card>
        <CardHeader className="sr-only">
          <CardTitle>Project Backlog</CardTitle>
          <CardDescription>A list of all tasks in the project backlog.</CardDescription>
        </CardHeader>
        <CardContent>
          <BacklogHeader table={table} handleOpenNewTaskDialog={handleOpenNewTaskDialog} />
        </CardContent>
      </Card>
    </div>
  )
}

function BacklogHeader({ table, handleOpenNewTaskDialog }: { table: Table<Task>, handleOpenNewTaskDialog: () => void }) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-2">
        {/* <BacklogSearch table={table} /> */}
        <BacklogFilters />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleOpenNewTaskDialog}>
          <PlusIcon className="w-4 h-4" />
          New Task
        </Button>
      </div>
    </div>
  )
}

function BacklogFilters() {
  return (
    <div className="flex gap-2">
      <Button variant="outline">
        <FilterIcon className="w-4 h-4" />
        Filters
      </Button>
    </div>
  )
}

function BacklogSearch({ table }: { table: Table<Task> }) {
  return (
    <div className="flex gap-2">

      <Input
        placeholder="Search by name or key..."
        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("name")?.setFilterValue(event.target.value)
        }
        autoFocus
        className="max-w-sm w-full"
      />
    </div>
  )
}