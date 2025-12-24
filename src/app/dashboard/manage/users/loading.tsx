import { UsersTableSkeleton } from "@/features/user/components/UsersTableSkeleton";

export default function UsersPageLoading() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col gap-4 bg-card rounded-md">
        <UsersTableSkeleton />
      </div>
    </div>
  );
}