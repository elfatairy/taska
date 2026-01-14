import { Skeleton } from "@/common/components/ui/skeleton"
import { DialogFooter } from "@/common/components/ui/dialog"
import { TooltipContent } from "@/common/components/ui/tooltip"
import { Badge } from "@/common/components/ui/badge"

export function AssignMembersSkeleton() {
  return (
    <>
      <div className="flex flex-col gap-2 my-4">
        {/* Search input skeleton */}
        <Skeleton className="h-10 w-full" />

        <div className="flex flex-col gap-3">
          {/* Users list skeleton */}
          <div className="flex flex-col max-h-[350px] overflow-y-auto gap-1">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div key={index} className="flex items-center justify-between gap-2 rounded-md px-2 py-1 border border-transparent">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </DialogFooter>
    </>
  )
}

export function TeamMembersTooltipSkeleton({ memberCount }: { memberCount: number }) {
  if (memberCount === 0) {
    return null
  }

  return (

    <TooltipContent side="left" className="w-80 p-2 bg-white border-gray-200 shadow-lg" arrowClassName="bg-white fill-white">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between border-b border-gray-200 pb-1">
          <h4 className="text-sm font-semibold text-gray-900">Team Members</h4>
          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-100">
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </Badge>
        </div>
        <div className="space-y-0.5">
          {[...Array(memberCount)].map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-1 rounded-md"
            >
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  {index === 0 && (
                    <Skeleton className="h-5 w-16" />
                  )}
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </TooltipContent>
  )
}