'use client'

import {
  Dialog,
  DialogContent,
} from "@/common/components/ui/dialog";
import { useNewSprintForm } from "@/features/sprint/hooks/useNewSprintForm";
import { useSearchParams } from "next/navigation";
import { useDialogSearchParams } from "@/common/hooks/useDialogSearchParams";
import { ProjectId } from "@/common/types";
import { NewSprintSuccess } from "./NewSprintSuccess";
import { NewSprintForm } from "./NewSprintForm";

export function useShouldOpenNewSprintDialog({ projectId }: { projectId?: ProjectId } = {}) {
  const searchParams = useSearchParams();
  return searchParams.get("modal") === "new-sprint" && (!projectId || searchParams.get("projectId") === projectId);
}

export function NewSprintDialog({
  children,
  open,
  onClose,
  projectId,
}: {
  children?: React.ReactNode,
  open: boolean,
  onClose: () => void,
  projectId: ProjectId,
}) {
  const { form, successData, reset, error } = useNewSprintForm({ projectId })
  const { handleUrlParams } = useDialogSearchParams({
    modal: "new-sprint",
    projectId: projectId.toString(),
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
            <NewSprintSuccess onClose={() => handleOpenChange(false)} /> :
            <NewSprintForm form={form} projectId={projectId} />
        }
      </DialogContent>
    </Dialog>
  )
}
