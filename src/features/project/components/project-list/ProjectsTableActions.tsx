"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/common/components/ui/dropdown-menu"
import { Button } from "@/common/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { CopyToClipboard } from "@/common/components/ui/copy"
import { CopyUncopied, CopyCopied } from "@/common/components/ui/copy"
import { Copy } from "lucide-react"
import { Check } from "lucide-react"
import { featureUnderDevelopment } from "@/lib/utils"
import { useUser } from "@clerk/nextjs"
import { useUserRole } from "@/common/hooks/useUserRole"
import { useRouter } from "next/navigation"
import { Project, ProjectId } from "@/common/types"
import { ProjectsTableActionsSkeleton } from "./ProjectsTableSkeleton"

export function ProjectsTableActions({ project, handleOpenProjectAssignTeamsDialog }: { project: Project, handleOpenProjectAssignTeamsDialog: () => void }) {
  const userRole = useUserRole();
  const { isLoaded } = useUser();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-3xs">
        <CopyProjectIdAction projectId={project._id} />
        <DropdownMenuSeparator />
        {!isLoaded && <ProjectsTableActionsSkeleton />}
        {isLoaded && userRole === "CTO" && <CTOActions handleOpenProjectAssignTeamsDialog={handleOpenProjectAssignTeamsDialog} />}
        {isLoaded && userRole === "Product Manager" && <ProductManagerActions project={project} />}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function CopyProjectIdAction({ projectId }: { projectId: ProjectId }) {
  return (
    <CopyToClipboard textToCopy={projectId} className="w-full h-full">
      <DropdownMenuItem onClick={(e) => e.preventDefault()}>
        <CopyUncopied>
          <span className="flex items-center gap-2">
            <Copy className="h-2 w-2 text-foreground" />
            Copy project ID
          </span>
        </CopyUncopied>
        <CopyCopied>
          <div className="flex items-center gap-2">
            <Check className="h-2 w-2 text-foreground" />
            Copied
          </div>
        </CopyCopied>
      </DropdownMenuItem>
    </CopyToClipboard>
  )
}

function CTOActions({ handleOpenProjectAssignTeamsDialog }: { handleOpenProjectAssignTeamsDialog: () => void }) {
  return (
    <>
      <DropdownMenuItem onClick={() => featureUnderDevelopment()}>
        Edit project
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleOpenProjectAssignTeamsDialog}>
        Assign teams
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => featureUnderDevelopment()}>
        Archive project
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => featureUnderDevelopment()}>
        Delete project
      </DropdownMenuItem>
    </>
  )
}

function ProductManagerActions({ project }: { project: Project }) {
  const router = useRouter()

  return (
    <>
      <DropdownMenuItem onClick={() => router.push(`/dashboard/projects/${project.slug}/teams`)}>
        Manage teams
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => router.push(`/dashboard/projects/${project.slug}/discussions`)}>
        View discussions
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => router.push(`/dashboard/projects/${project.slug}/sprints`)}>
        Manage sprints
      </DropdownMenuItem>
    </>
  )
}