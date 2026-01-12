"use client"

import { useAccountQuery } from "@/features/account/useAccount";
import { NewSprintDialog, useShouldOpenNewSprintDialog } from "@/features/sprint/components/NewSprintDialog";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Project } from "../types";
import { Button } from "@/components/ui/button";

export function ProjectSprints({ projectSlug }: { projectSlug: string }) {
  const projectQuery = useAccountQuery(api.project.getProjectBySlug, {
    projectSlug,
  });

  if (!projectQuery) {
    return <div>Loading...</div>;
  }

  if (projectQuery.error) {
    return <div>{projectQuery.error}</div>;
  }

  return <ProjectSprintsContent project={projectQuery.data} />;
}

function ProjectSprintsContent({ project }: { project: Project }) {
  const shouldOpenNewSprintDialog = useShouldOpenNewSprintDialog({ projectId: project._id });
  const [openNewSprintDialog, setOpenNewSprintDialog] = useState(shouldOpenNewSprintDialog);

  function handleOpenNewSprintDialog() {
    setOpenNewSprintDialog(true);
  }

  function handleCloseNewSprintDialog() {
    setOpenNewSprintDialog(false);
  }

  return (
    <div>
      <NewSprintDialog
        open={openNewSprintDialog}
        onClose={handleCloseNewSprintDialog}
        projectId={project._id}
      />
      <Button
        onClick={handleOpenNewSprintDialog}
      >
        New Sprint
      </Button>
    </div>
  )
}