"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { CopyToClipboard } from "@/components/ui/copy"
import { CopyUncopied, CopyCopied } from "@/components/ui/copy"
import { Copy } from "lucide-react"
import { Check } from "lucide-react"
import { featureUnderDevelopment } from "@/lib/utils"
import { useUser } from "@clerk/nextjs"
import { useUserRole } from "@/hooks/useUserRole"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Project } from "@/common/types"

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
        <CopyToClipboard textToCopy={project._id} className="w-full h-full">
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
        <DropdownMenuSeparator />
        {!isLoaded && Array.from({ length: 3 }).map((_, index) => (
          <DropdownMenuItem key={index}>
            <Skeleton className="h-4 w-full" />
          </DropdownMenuItem>
        ))}
        {isLoaded && userRole === "CTO" && (
          <CTOActions
            handleOpenProjectAssignTeamsDialog={handleOpenProjectAssignTeamsDialog}
          />
        )}
        {isLoaded && userRole === "Product Manager" && <ProductManagerActions project={project} />}
      </DropdownMenuContent>
    </DropdownMenu>
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