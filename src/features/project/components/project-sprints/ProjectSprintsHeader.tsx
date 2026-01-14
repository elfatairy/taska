import { ProjectSprintsHeaderSkeleton } from "@/features/project/components/project-sprints/ProjectSprintsSkeleton";
import { useAccountQuery } from "@/common/hooks/useAccount";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/common/components/ui/breadcrumb";


export function ProjectSprintsHeader({ projectSlug }: { projectSlug: string }) {
  const projectQuery = useAccountQuery(api.project.getProjectBySlug, {
    projectSlug,
  });

  if (!projectQuery) {
    return <ProjectSprintsHeaderSkeleton />;
  }

  if (projectQuery.error) {
    return <div>Error: {projectQuery.error}</div>;
  }

  const project = projectQuery.data;

  return (
    <>
      
      <div className="flex justify-between items-center">
        <ProjectSprintsBreadcrumb projectName={project.name} projectSlug={projectSlug} />
      </div>
    </>
  )
}

function ProjectSprintsBreadcrumb({ projectName, projectSlug }: { projectName: string, projectSlug: string }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard/projects">Projects</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={`/dashboard/projects/${projectSlug}`}>{projectName}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Sprints</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}