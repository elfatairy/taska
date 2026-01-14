'use client'

import {
  Dialog,
  DialogContent,
} from "@/common/components/ui/dialog";
import { TASK_STATUS } from "@convex/utils/constants";
import { useNewTaskForm } from "@/features/task/hooks/useNewTaskForm";
import { useSearchParams } from "next/navigation";
import { NewTaskSuccess } from "./NewTaskSuccess";
import { NewTaskForm } from "./NewTaskForm";
import { useDialogSearchParams } from "@/common/hooks/useDialogSearchParams";
import { ProjectId, TeamId } from "@/common/types";

export function useShouldOpenNewTaskDialog({ projectId, teamId }: { projectId?: ProjectId, teamId?: TeamId } = {}) {
  const searchParams = useSearchParams();
  return searchParams.get("modal") === "new-task" && (!projectId || searchParams.get("projectId") === projectId) && (!teamId || searchParams.get("teamId") === teamId);
}

export function NewTaskDialog({
  children,
  open,
  status,
  onClose,
  teamId,
  projectId,
}: {
  children?: React.ReactNode,
  open: boolean,
  onClose: () => void,
  projectId: ProjectId,
  teamId?: TeamId,
  status: typeof TASK_STATUS[number],
}) {
  const { form, successData, reset, error } = useNewTaskForm({ projectId, status })
  const { handleUrlParams } = useDialogSearchParams({
    modal: "new-task",
    projectId: projectId.toString(),
    teamId: teamId?.toString(),
  }, open);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
      setTimeout(reset, 100);
    }
    handleUrlParams(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {error && <div className="text-red-500 text-sm">{error}</div> /** TODO: Show a proper error ui */}
        {
          successData ?
            <NewTaskSuccess onClose={() => handleOpenChange(false)} /> :
            <NewTaskForm form={form} projectId={projectId} />
        }
      </DialogContent>
    </Dialog>
  )
}
