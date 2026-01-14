import { ProjectBacklog } from "@/features/project/components/project-backlog/ProjectBacklog";
import { AwaitParams } from "@/common/components/AwaitParams";

export default function BacklogPage({ params }: PageProps<'/dashboard/projects/[projectSlug]/backlog'>) {
  return (
    <div>
      <AwaitParams params={params}>
        {({ projectSlug }) => (
          <ProjectBacklog projectSlug={projectSlug} />
        )}
      </AwaitParams>
    </div>
  )
}