"use client"

import { Search } from "@/components/icons"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAccountMutation, useAccountQuery } from "@/features/account/useAccount"
import { api } from "@convex/_generated/api"
import { Minus, Plus } from "lucide-react"
import { useState } from "react"
import { Doc, Id } from "@convex/_generated/dataModel"
import { useWithLoading } from "@/hooks/useWithLoading"
import { Spinner } from "@/components/ui/spinner"
import { TeamAssignToProjectDialogSkeleton } from "./ProjectAssignTeamsDialogSkeleton"

type Team = Doc<"teams"> & {
  memberIds: Doc<"users">["_id"][];
  teamLead: Doc<"users"> | null;
  projectIds: Doc<"projects">["_id"][];
}
type ProjectId = Id<"projects">

export function ProjectAssignTeamsDialog({ children, projectId }: { children: React.ReactNode, projectId: ProjectId }) {
  return (
    <Dialog>
      {children}
      <DialogContent className="md:max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <DialogTitle className="sr-only">Assign teams to project</DialogTitle>
        <ProjectAssignTeamsDialogContent projectId={projectId} />
      </DialogContent>
    </Dialog>
  )
}

export function ProjectAssignTeamsDialogTrigger({ children }: { children: React.ReactNode }) {
  return (
    <DialogTrigger asChild>
      {children}
    </DialogTrigger>
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

function ProjectAssignTeamsDialogItem({ team, projectId, isAssigned }: { team: Team, projectId: ProjectId, isAssigned: boolean }) {
  const assignToProjectMutation = useAccountMutation(api.team.assignTeamsToProject);
  const unassignFromProjectMutation = useAccountMutation(api.team.unassignTeamsFromProject);
  const { isLoading: isAssigningLoading, runWithLoading: runWithAssigningLoading } = useWithLoading();
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
            disabled={isAssigningLoading}
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
            disabled={isUnassigningLoading}
          >
            {isUnassigningLoading ? <Spinner className="h-4 w-4 animate-spin" /> : <Minus className="h-4 w-4 mr-1" />}
            Unassign
          </Button>
        )}
      </div>
    </div>
  )
}