import { DialogHeader } from "@/common/components/ui/dialog"
import { Skeleton } from "@/common/components/ui/skeleton"
import { TooltipContent } from "@/common/components/ui/tooltip"
import { Badge } from "@/common/components/ui/badge"

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

export function TeamProjectsTooltipSkeleton({ projectCount }: { projectCount: number }) {
  if (projectCount === 0) {
    return null
  }

  return (
    <TooltipContent side="left" className={"w-80 p-2 bg-white border-gray-200 shadow-lg"} arrowClassName={"bg-white fill-white"}>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between border-b border-gray-200 pb-1">
          <h4 className="text-sm font-semibold text-gray-900">Team Projects</h4>
          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-100">
            {projectCount} {projectCount === 1 ? 'project' : 'projects'}
          </Badge>
        </div>
        <div className="space-y-0.5">
          {[...Array(projectCount)].map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-1 rounded-md"
            >
              <Skeleton className="h-8 w-8 rounded-md shrink-0" />

              <div className="flex-1 min-w-0 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </TooltipContent>
  )
}
