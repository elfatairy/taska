import { Skeleton } from "@/common/components/ui/skeleton";

export function EditTeamDetailsSkeleton() {
  return (
    <div className="grid gap-4 py-4">
      {/* Name field */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-10 w-full" />
      </div>
      {/* Description field */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-24 w-full" />
      </div>
      {/* Slug field */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-10 w-full" />
      </div>
      {/* Team Lead combobox */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      {/* Submit button */}
      <Skeleton className="h-10 w-full mt-2" />
    </div>
  );
}