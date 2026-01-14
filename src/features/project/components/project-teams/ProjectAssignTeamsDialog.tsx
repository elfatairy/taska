"use client"

import { Search } from "@/common/components/icons"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/common/components/ui/dialog"
import { Input } from "@/common/components/ui/input"
import { Button } from "@/common/components/ui/button"
import { Badge } from "@/common/components/ui/badge"
import { useAccountMutation, useAccountQuery } from "@/common/hooks/useAccount"
import { api } from "@convex/_generated/api"
import { Minus, Plus } from "lucide-react"
import { useState } from "react"
import { useWithLoading } from "@/common/hooks/useWithLoading"
import { Spinner } from "@/common/components/ui/spinner"
import { TeamAssignToProjectDialogSkeleton } from "@/features/project/components/project-teams/ProjectAssignTeamsDialogSkeleton"
import { useSearchParams } from "next/navigation"
import type { ProjectId } from "@/common/types"
import type { ProjectTeam } from "@/features/project/types"
import { useDialogSearchParams } from "@/common/hooks/useDialogSearchParams"

export function useShouldOpenProjectAssignTeamsDialog(projectId?: ProjectId) {
  const searchParams = useSearchParams();
  return searchParams.get("modal") === "project-assign-teams" && (!projectId || searchParams.get("projectId") === projectId);
}

export function ProjectAssignTeamsDialog({
  projectId,
  open,
  onClose,
}: {
  projectId: ProjectId,
  open: boolean,
  onClose: () => void,
}) {
  const { handleUrlParams } = useDialogSearchParams({
    "modal": "project-assign-teams",
    "projectId": projectId,
  }, open);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
    handleUrlParams(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="md:max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <DialogTitle className="sr-only">Assign teams to project</DialogTitle>
        <ProjectAssignTeamsDialogContent projectId={projectId} />
      </DialogContent>
    </Dialog>
  )
}

export function ProjectAssignTeamsDialogContent({ projectId }: { projectId: ProjectId }) {
  const teamsQuery = useAccountQuery(api.team.getTeams);
  const [searchValue, setSearchValue] = useState("");

  if (!teamsQuery) {
    return <TeamAssignToProjectDialogSkeleton />;
  }

  if (teamsQuery.error) {
    return <div>Error: {teamsQuery.error}</div>; // TODO: Make ui better
  }

  const filteredTeams = [
    // Teams by name
    ...teamsQuery.data.filter((team) => team.name.toLowerCase().includes(searchValue.toLowerCase())),
    // Teams by description
    ...teamsQuery.data.filter((team) => team.description && !team.name.toLowerCase().includes(searchValue.toLowerCase()) && team.description.toLowerCase().includes(searchValue.toLowerCase()))
  ]

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2 w-full">
          <Input
            className="w-2/3"
            type="text"
            placeholder="Search for a team"
            onChange={(e) => setSearchValue(e.target.value)}
            icon={Search}
            iconProps={{ behavior: 'prepend' }}
          />
        </div>
      </DialogHeader>
      <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
        {filteredTeams.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No teams found
          </div>
        ) : (
          filteredTeams.map((team) => {
            const isAssigned = team.projectIds.includes(projectId);
            return <ProjectAssignTeamsDialogItem key={team._id} team={team} projectId={projectId} isAssigned={isAssigned} />
          })
        )}
      </div>
    </>
  )
}

function ProjectAssignTeamsDialogItem({ team, projectId, isAssigned }: { team: ProjectTeam, projectId: ProjectId, isAssigned: boolean }) {
  const assignToProjectMutation = useAccountMutation(api.team.assignTeamsToProject);
  const { isLoading: isAssigningLoading, runWithLoading: runWithAssigningLoading } = useWithLoading();
  const unassignFromProjectMutation = useAccountMutation(api.team.unassignTeamsFromProject);
  const { isLoading: isUnassigningLoading, runWithLoading: runWithUnassigningLoading } = useWithLoading();

  const handleAssign = () => {
    runWithAssigningLoading(async () => {
      await assignToProjectMutation({
        teamsIds: [team._id],
        projectId: projectId
      });
    });
  };

  const handleUnassign = () => {
    runWithUnassigningLoading(async () => {
      await unassignFromProjectMutation({
        teamsIds: [team._id],
        projectId: projectId
      });
    });
  };

  const containerClasses = isAssigned
    ? "bg-primary/5 border-primary/30 hover:bg-primary/10 hover:border-primary/50"
    : "bg-background border-border hover:bg-accent hover:border-accent-foreground/20";

  const buttonsDisabled = isAssigningLoading || isUnassigningLoading;

  return (
    <div
      key={team._id}
      className={`flex items-center gap-3 rounded-lg border p-4 transition-colors group ${containerClasses}`}
    >
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-foreground truncate">{team.name}</h3>
          {isAssigned && (
            <Badge className="bg-primary/20 text-primary border-transparent leading-none">
              Assigned
            </Badge>
          )}
        </div>
        {team.description && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {team.description}
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{team.memberIds.length} member{team.memberIds.length !== 1 ? 's' : ''}</span>
          {team.teamLead && (
            <>
              <span>•</span>
              <span>Lead: {team.teamLead.name}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!isAssigned && (
          <Button
            size="sm"
            className={`shrink-0 cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100`}
            variant="outline"
            onClick={handleAssign}
            disabled={buttonsDisabled}
          >
            {isAssigningLoading ? <Spinner className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
            Assign
          </Button>
        )}

        {isAssigned && (
          <Button
            size="sm"
            className="shrink-0 cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
            variant="destructive"
            onClick={handleUnassign}
            disabled={buttonsDisabled}
          >
            {isUnassigningLoading ? <Spinner className="h-4 w-4 animate-spin" /> : <Minus className="h-4 w-4 mr-1" />}
            Unassign
          </Button>
        )}
      </div>
    </div>
  )
}
