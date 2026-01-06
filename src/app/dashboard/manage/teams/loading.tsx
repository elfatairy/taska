import { TeamsTableSkeleton } from "@/features/team/components/TeamsTableSkeleton";

export default function TeamsPageLoading() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col gap-4 bg-card rounded-md">
        <TeamsTableSkeleton />
      </div>
    </div>
  );
}