import { ProjectBacklogsHeaderLoading } from "./ProjectBacklogLoading";
import { useAccountQuery } from "@/features/account/useAccount";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";


export function ProjectBacklogHeader({ projectSlug }: { projectSlug: string }) {
  const projectQuery = useAccountQuery(api.project.getProjectBySlug, {
    projectSlug,
  });

  if (!projectQuery) {
    return <ProjectBacklogsHeaderLoading />;
  }

  if (projectQuery.error) {
    return <div>Error: {projectQuery.error}</div>;
  }

  const project = projectQuery.data;

  return (
    <>
      
      <div className="flex justify-between items-center">
        <ProjectBacklogBreadcrumb projectName={project.name} projectSlug={projectSlug} />
      </div>
    </>
  )
}

function ProjectBacklogBreadcrumb({ projectName, projectSlug }: { projectName: string, projectSlug: string }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard/projects">Projects</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={`/dashboard/projects/${projectSlug}`}>{projectName}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Project Backlog</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}