import { DropdownMenuItem } from "@/common/components/ui/dropdown-menu"
import { Skeleton } from "@/common/components/ui/skeleton"

export function ProjectBacklogsHeaderSkeleton() {
  return (
    <div>
      Loading...
    </div>
  )
}

export function ProjectBacklogTableActionsSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <DropdownMenuItem key={index}>
          <Skeleton className="h-4 w-full" />
        </DropdownMenuItem>
      ))}
    </>
  )
}