import { Skeleton } from "@/components/ui/skeleton"

export function TeamProjectsTooltipSkeleton({ projectCount }: { projectCount: number }) {
  if (projectCount === 0) {
    return null
  }

  return (
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
  )
}
