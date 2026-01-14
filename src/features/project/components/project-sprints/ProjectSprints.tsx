"use client"

import { useAccountQuery } from "@/common/hooks/useAccount";
import { NewSprintDialog, useShouldOpenNewSprintDialog } from "@/features/sprint/components/sprint-creation/NewSprintDialog";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import type { Project } from "@/common/types";
import { Button } from "@/common/components/ui/button";
import { ProjectSprintsHeader } from "@/features/project/components/project-sprints/ProjectSprintsHeader";

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
    <div className="flex flex-col gap-2 p-6">
      <ProjectSprintsHeader projectSlug={project.slug} />

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