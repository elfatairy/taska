import { ProjectsTableSkeleton } from "@/features/project/components/ProjectsTableSkeleton";

export default function ProjectsPageLoading() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col gap-4 bg-card rounded-md">
        <ProjectsTableSkeleton />
      </div>
    </div>
  );
}