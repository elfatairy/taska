import { AwaitParams } from "@/components/AwaitParams";
import { ProjectSprints } from "@/features/project/components/ProjectSprints";

export default function SprintsPage({ params }: PageProps<'/dashboard/projects/[projectSlug]/sprints'>) {
  return (
    <div>
      <AwaitParams params={params}>
        {({ projectSlug }) => (
          <ProjectSprints projectSlug={projectSlug} />
        )}
      </AwaitParams>
    </div>
  )
}