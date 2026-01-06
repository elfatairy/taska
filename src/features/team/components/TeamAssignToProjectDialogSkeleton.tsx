import { DialogHeader } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

export function TeamAssignToProjectDialogSkeleton() {
  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2 w-full">
          <Skeleton className="h-10 w-2/3" />
        </div>
      </DialogHeader>
      <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
        {Array.from({ length: 5 }).map((_, index) => (
          <TeamAssignToProjectDialogItemSkeleton key={index} />
        ))}
      </div>
    </>
  )
}

function TeamAssignToProjectDialogItemSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-4 bg-background border-border">
      <Skeleton className="h-5 w-5 shrink-0" />
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-9 w-20 shrink-0" />
    </div>
  )
}
