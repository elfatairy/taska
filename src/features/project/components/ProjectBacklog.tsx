"use client"

import { useAccountQuery } from "@/features/account/useAccount";
import { NewTaskDialog, useShouldOpenNewTaskDialog } from "@/features/task/components/NewTaskDialog";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Project } from "../types";
import { Button } from "@/components/ui/button";

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

  function handleOpenNewTaskDialog() {
    setOpenNewTaskDialog(true);
  }

  function handleCloseNewTaskDialog() {
    setOpenNewTaskDialog(false);
  }

  return (
    <div>
      <NewTaskDialog
        open={openNewTaskDialog}
        onClose={handleCloseNewTaskDialog}
        projectId={project._id}
        status="BACKLOG"
      />
      <Button
        onClick={handleOpenNewTaskDialog}
      >
        New Task
      </Button>
    </div>
  )
}