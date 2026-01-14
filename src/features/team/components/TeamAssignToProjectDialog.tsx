import { Search } from "@/components/icons"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAccountMutation, useAccountQuery } from "@/features/account/useAccount"
import { api } from "@convex/_generated/api"
import { Icon } from "@/components/Icon"
import { getProjectIcon } from "@/features/project/utils/getProjectIcon"
import { Minus, Plus } from "lucide-react"
import { useEffect, useEffectEvent, useState } from "react"
import { useWithLoading } from "@/hooks/useWithLoading"
import { Spinner } from "@/components/ui/spinner"
import { TeamAssignToProjectDialogSkeleton } from "./TeamAssignToProjectDialogSkeleton"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Project, TeamId } from "@/common/types"

export function useShouldOpenAssignToProjectDialog(teamsIds?: TeamId[]) {
  const searchParams = useSearchParams();
  return searchParams.get("modal") === "assign-to-project" && (!teamsIds || searchParams.get("teamsIds") === teamsIds.join(","));
}

export function TeamAssignToProjectDialog({
  children,
  open,
  onClose,
  teamsIds,
}: {
  children?: React.ReactNode,
  open: boolean,
  onClose: () => void,
  teamsIds: TeamId[]
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  // TODO: implement success state

  const teamsIdsString = teamsIds.join(",")
  const handleUrlParams = (isOpen: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (isOpen) {
      params.set("modal", "assign-to-project");
      params.set("teamsIds", teamsIdsString);
    } else {
      params.delete("modal");
      params.delete("teamsIds");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
    handleUrlParams(isOpen);
  }

  const handleUrlParamsEffect = useEffectEvent(handleUrlParams);
  useEffect(() => {
    if (open) handleUrlParamsEffect(true);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} >
      {children}
      <DialogContent className="md:max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <DialogHeader className="sr-only">
          <DialogTitle>Assign to project</DialogTitle>
          <DialogDescription>Select a project to assign to the teams</DialogDescription>
        </DialogHeader>
        <TeamAssignToProjectDialogContent teamsIds={teamsIds} />
      </DialogContent>
    </Dialog>
  )
}

export function TeamAssignToProjectDialogTrigger({ children }: { children: React.ReactNode }) {
  return (
    <DialogTrigger asChild>
      {children}
    </DialogTrigger>
  )
}

export function TeamAssignToProjectDialogContent({ teamsIds }: { teamsIds: TeamId[] }) {
  const teamsProjectsQuery = useAccountQuery(api.team.getTeamsProjects, { teamsIds: teamsIds });
  const projectsQuery = useAccountQuery(api.project.getProjects);
  const [searchValue, setSearchValue] = useState("");

  if (!teamsProjectsQuery || !projectsQuery) {
    return <TeamAssignToProjectDialogSkeleton />;
  }

  if (teamsProjectsQuery.error || projectsQuery.error) {
    return <div>Error: {projectsQuery.error}</div>; // TODO: Make ui better
  }

  const filteredProjects = [
    // Projects by name
    ...projectsQuery.data.filter((project) => project.name.toLowerCase().includes(searchValue.toLowerCase())),
    // Projects by description
    ...projectsQuery.data.filter((project) => project.description && !project.name.toLowerCase().includes(searchValue.toLowerCase()) && project.description.toLowerCase().includes(searchValue.toLowerCase()))
  ]

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2 w-full">
          <Input
            className="w-2/3"
            type="text"
            placeholder="Search for a project"
            onChange={(e) => setSearchValue(e.target.value)}
            icon={Search}
            iconProps={{ behavior: 'prepend' }}
          />
        </div>
      </DialogHeader>
      <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No projects found
          </div>
        ) : (
          filteredProjects.map((project) => {
            const assignedTeamsCount = Object.values(teamsProjectsQuery.data).filter((teamProjects) => teamProjects.map((teamProject) => teamProject.project._id).includes(project._id)).length;
            return <TeamAssignToProjectDialogItem key={project._id} project={project} teamsIds={teamsIds} assignedTeamsCount={assignedTeamsCount} />
          })
        )}
      </div>
    </>
  )
}

function TeamAssignToProjectDialogItem({ project, teamsIds, assignedTeamsCount }: { project: Project, teamsIds: TeamId[], assignedTeamsCount: number }) {
  const assignToProjectMutation = useAccountMutation(api.team.assignTeamsToProject);
  const unassignFromProjectMutation = useAccountMutation(api.team.unassignTeamsFromProject);
  const { isLoading: isAssigningLoading, runWithLoading: runWithAssigningLoading } = useWithLoading();
  const { isLoading: isUnassigningLoading, runWithLoading: runWithUnassigningLoading } = useWithLoading();

  const totalTeamsCount = teamsIds.length;
  const isFullyAssigned = assignedTeamsCount === totalTeamsCount;
  const isPartiallyAssigned = assignedTeamsCount > 0 && assignedTeamsCount < totalTeamsCount;

  const handleAssignAll = () => {
    runWithAssigningLoading(async () => {
      await assignToProjectMutation({
        teamsIds: teamsIds,
        projectId: project._id
      });
    });
  };

  const handleUnassignAll = () => {
    runWithUnassigningLoading(async () => {
      await unassignFromProjectMutation({
        teamsIds: teamsIds,
        projectId: project._id
      });
    });
  };

  const containerClasses = isFullyAssigned
    ? "bg-primary/5 border-primary/30 hover:bg-primary/10 hover:border-primary/50"
    : isPartiallyAssigned
      ? "bg-amber-50/50 border-amber-300/50 hover:bg-amber-100/50 hover:border-amber-400/50"
      : "bg-background border-border hover:bg-accent hover:border-accent-foreground/20";

  return (
    <div
      key={project._id}
      className={`flex items-center gap-3 rounded-lg border p-4 transition-colors group ${containerClasses}`}
    >
      <Icon icon={getProjectIcon(project.type)} size={20} />
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-foreground truncate">{project.name}</h3>
          {isFullyAssigned && (
            <Badge className="bg-primary/20 text-primary border-transparent leading-none">
              Assigned{totalTeamsCount > 1 && ` to all teams`}
            </Badge>
          )}
          {isPartiallyAssigned && (
            <Badge className="bg-amber-100 text-amber-700 border-transparent leading-none">
              {assignedTeamsCount}/{totalTeamsCount} Teams Assigned
            </Badge>
          )}
        </div>
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {project.description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {!isFullyAssigned && (
          <Button
            size="sm"
            className={`shrink-0 cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100`}
            variant="outline"
            onClick={handleAssignAll}
            disabled={isAssigningLoading}
          >
            {isAssigningLoading ? <Spinner className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
            Assign{totalTeamsCount > 1 && ` All`}
          </Button>
        )}

        {(isFullyAssigned || isPartiallyAssigned) && (
          <Button
            size="sm"
            className="shrink-0 cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
            variant="destructive"
            onClick={handleUnassignAll}
            disabled={isUnassigningLoading}
          >
            {isUnassigningLoading ? <Spinner className="h-4 w-4 animate-spin" /> : <Minus className="h-4 w-4 mr-1" />}
            Unassign{totalTeamsCount > 1 && ` All`}
          </Button>
        )}
      </div>
    </div>
  )
}