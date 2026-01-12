import { ProjectBacklog } from "@/features/project/components/ProjectBacklog";
import { AwaitParams } from "@/components/AwaitParams";

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