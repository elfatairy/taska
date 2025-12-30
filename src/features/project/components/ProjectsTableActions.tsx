"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { CopyToClipboard } from "@/components/ui/copy"
import { CopyUncopied, CopyCopied } from "@/components/ui/copy"
import { Copy } from "lucide-react"
import { Check } from "lucide-react"
import { featureUnderDevelopment } from "@/lib/utils"
import { Project } from "./ProjectsTableColumns"
import { useUser } from "@clerk/nextjs"
import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

export function ProjectsTableActions({ project }: { project: Project }) {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  const actions = useMemo(() => {
    if (user?.publicMetadata.role === "CTO") {
      return [
        {
          label: "Edit project",
          onClick: () => featureUnderDevelopment(),
        },
        {
          label: "Archive project",
          onClick: () => featureUnderDevelopment(),
        },
        {
          label: "Delete project",
          onClick: () => featureUnderDevelopment(),
        },
      ]
    } else if (user?.publicMetadata.role === "Product Manager") {
      return [
        {
          label: "Manage teams",
          onClick: () => router.push(`/dashboard/projects/${project.slug}/teams`),
        },
        {
          label: "View discussions",
          onClick: () => router.push(`/dashboard/projects/${project.slug}/discussions`),
        },
        {
          label: "Manage sprints",
          onClick: () => router.push(`/dashboard/projects/${project.slug}/sprints`),
        },
      ]
    } else {
      return []
    }
  }, [user?.publicMetadata.role, router, project.slug])

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
        {
          isLoaded ? actions.map((action) => (
            <DropdownMenuItem key={action.label} onClick={action.onClick}>
              {action.label}
            </DropdownMenuItem>
          )) : Array.from({ length: 3 }).map((_, index) => (
            <DropdownMenuItem key={index}>
              <Skeleton className="h-4 w-full" />
            </DropdownMenuItem>
          ))
        }
      </DropdownMenuContent>
    </DropdownMenu>
  )
}