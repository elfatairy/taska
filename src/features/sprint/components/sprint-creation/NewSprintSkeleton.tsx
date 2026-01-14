import { DialogHeader, DialogTitle, DialogDescription } from "@/common/components/ui/dialog";
import { Skeleton } from "@/common/components/ui/skeleton";

export function NewSprintSkeleton() {
  return (
    <div>
      <DialogHeader>
        <DialogTitle>New Sprint</DialogTitle>
        <DialogDescription>
          Create a new sprint for the project. Fill in the details below.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        {/* Sprint Name field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        {/* Team field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>
        {/* Goal field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-20 w-full" />
        </div>
        {/* Start and End Date fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        {/* Submit button */}
        <Skeleton className="h-10 w-full mt-2" />
      </div>
    </div>
  );
}
