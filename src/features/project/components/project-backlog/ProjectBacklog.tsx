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
import { Project, Team, TeamProject } from "@/common/types";
import { ProjectBacklogTable } from "./ProjectBacklogTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectBacklogTable } from "../../hooks/useProjectBacklogTable";
import { projectBacklogTableColumns } from "./ProjectBacklogTableColumns";


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

  return <BacklogContainer project={projectQuery.data} />;
}

function BacklogContainer({ project }: { project: Project }) {
  const shouldOpenNewTaskDialog = useShouldOpenNewTaskDialog({ projectId: project._id });
  const [openNewTaskDialog, setOpenNewTaskDialog] = useState(shouldOpenNewTaskDialog);
  const projectTeamsQuery = useAccountQuery(api.project.getProjectTeams, {
    projectId: project._id,
  });
  const { table } = useProjectBacklogTable({ projectId: project._id });


  function handleOpenNewTaskDialog() {
    setOpenNewTaskDialog(true);
  }

  function handleCloseNewTaskDialog() {
    setOpenNewTaskDialog(false);
  }

  const projectTeams = projectTeamsQuery?.data || [];

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
          <Tabs defaultValue="all" onValueChange={(value) => {
            table.getColumn("team_id")?.setFilterValue(value === "all" ? null : value);
          }}>
            <BacklogHeader table={table} projectTeams={projectTeams} handleOpenNewTaskDialog={handleOpenNewTaskDialog} />
            <BacklogContent table={table} projectTeams={projectTeams} handleOpenNewTaskDialog={handleOpenNewTaskDialog} />
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function BacklogHeader({
  table,
  projectTeams,
  handleOpenNewTaskDialog
}: {
  table: Table<Task>,
  projectTeams: Team[],
  handleOpenNewTaskDialog: () => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 ">
          <BacklogSearch table={table} />
          <BacklogFilters table={table} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleOpenNewTaskDialog}>
            <PlusIcon className="w-4 h-4" />
            New Task
          </Button>
        </div>
      </div>

      <TabsList>
        <TabsTrigger value="all">All Teams</TabsTrigger>
        {
          projectTeams.map((team) => (
            <TabsTrigger key={team._id} value={team._id}>
              {team.name}
            </TabsTrigger>
          ))
        }
      </TabsList>
    </div>
  )
}

function BacklogContent({
  table,
  projectTeams,
  handleOpenNewTaskDialog
}: {
  table: Table<Task>,
  projectTeams: Team[],
  handleOpenNewTaskDialog: () => void
}) {
  console.log("rendering")
  return (
    <>
      <TabsContent value="all">
        <ProjectBacklogTable
          table={table}
          columns={projectBacklogTableColumns}
          teamId={null}
          handleOpenNewTaskDialog={handleOpenNewTaskDialog}
        />
      </TabsContent>
      {
        projectTeams.map((team) => (
          <TabsContent key={team._id} value={team._id}>
            <ProjectBacklogTable
              table={table}
              columns={projectBacklogTableColumns}
              teamId={team._id}
              handleOpenNewTaskDialog={handleOpenNewTaskDialog}
            />
          </TabsContent>
        ))
      }
    </>
  )
}

function BacklogFilters({ table }: { table: Table<Task> }) {
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
        placeholder="Search by task title or description..."
        value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("title")?.setFilterValue(event.target.value)
        }
        autoFocus
        className="max-w-sm w-full"
      />
    </div>
  )
}