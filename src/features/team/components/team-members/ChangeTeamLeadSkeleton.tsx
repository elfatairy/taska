import { DialogFooter } from "@/common/components/ui/dialog";
import { Skeleton } from "@/common/components/ui/skeleton";


export function ChangeTeamLeadSkeleton() {
  return (
    <>
      <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
        {[1, 2, 3, 4, 5].map((index) => (
          <div key={index} className="flex items-center gap-3 p-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-col gap-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
      <DialogFooter>
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-28" />
      </DialogFooter>
    </>
  );
}