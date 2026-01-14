'use client'

import {
  Dialog,
  DialogContent,
} from "@/common/components/ui/dialog";
import { useNewUserForm } from "@/features/user/hooks/useNewUserForm";
import { useSearchParams } from "next/navigation";
import { useDialogSearchParams } from "@/common/hooks/useDialogSearchParams";
import { NewUserSuccess } from "@/features/user/components/user-creation/NewUserSuccess";
import { NewUserForm } from "@/features/user/components/user-creation/NewUserForm";

export function useShouldOpenNewUserDialog() {
  const searchParams = useSearchParams();
  return searchParams.get("modal") === "new-user";
}

export function NewUserDialog({ 
  children,
  open,
  onClose
}: { 
  children?: React.ReactNode,
  open: boolean,
  onClose: () => void
}) {
  const { form, successData, reset, error } = useNewUserForm()
  const { handleUrlParams } = useDialogSearchParams({
    modal: "new-user",
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
      <DialogContent>
        {error && <div className="text-red-500 text-sm">{error}</div> /** TODO: Show a proper error ui */}
        {
          successData ?
            <NewUserSuccess successData={successData} isTemporaryPassword={form.state.values.requirePasswordChange} /> :
            <NewUserForm form={form} />
        }
      </DialogContent>
    </Dialog>
  )
}