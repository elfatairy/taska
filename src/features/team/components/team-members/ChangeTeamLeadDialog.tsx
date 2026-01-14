import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/common/components/ui/dialog";
import type { TeamId, TeamMemberWithUser, UserId } from "@/common/types";
import { api } from "@convex/_generated/api";
import { useAccountQuery, useAccountMutation } from "@/common/hooks/useAccount";
import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar";
import { Button } from "@/common/components/ui/button";
import { Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useWithLoading } from "@/common/hooks/useWithLoading";
import { useSearchParams } from "next/navigation";
import { useDialogSearchParams } from "@/common/hooks/useDialogSearchParams";
import { ChangeTeamLeadDialogSuccess } from "./ChangeTeamLeadDialogSuccess";
import { ChangeTeamLeadSkeleton } from "./ChangeTeamLeadSkeleton";
import { UserAvatar, UserSummary } from "@/common/components/UserSummary";

export function useShouldOpenChangeTeamLeadDialog(teamId?: TeamId) {
  const searchParams = useSearchParams();
  return searchParams.get("modal") === "change-team-lead" && (!teamId || searchParams.get("teamId") === teamId);
}

export function ChangeTeamLeadDialog({ children, open, onClose, teamId }: { children?: React.ReactNode, open: boolean, onClose: () => void, teamId: TeamId }) {
  const { handleUrlParams } = useDialogSearchParams({
    "modal": "change-team-lead",
    "teamId": teamId,
  }, open);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClose = () => {
    onClose();
    setTimeout(() => setShowSuccess(false), 3000);
    handleUrlParams(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
      setShowSuccess(false);
    }
    handleUrlParams(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Team Lead</DialogTitle>
          {!showSuccess && (
            <DialogDescription>Select a new team lead for the team</DialogDescription>
          )}
        </DialogHeader>

        {
          showSuccess ? (
            <ChangeTeamLeadDialogSuccess onClose={handleClose} />
          ) : (
            <ChangeTeamLeadDialogContent
              teamId={teamId}
              onSuccess={() => setShowSuccess(true)}
              onCancel={handleClose}
            />
          )
        }
      </DialogContent>
    </Dialog>
  );
}

function ChangeTeamLeadDialogContent({
  teamId,
  onSuccess,
  onCancel,
}: {
  teamId: TeamId;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const teamMembersQuery = useAccountQuery(api.team.getTeamMembers, {
    teamId: teamId,
  });

  const changeTeamLeadMutation = useAccountMutation(api.team.changeTeamLead);

  const [selectedTeamLeadId, setSelectedTeamLeadId] = useState<UserId | undefined>(undefined);
  const { isLoading: isSaving, runWithLoading: runWithSaving } = useWithLoading();

  if (!teamMembersQuery) {
    return <ChangeTeamLeadSkeleton />;
  }

  if (teamMembersQuery?.error) {
    return <div>Error: {teamMembersQuery.error}</div>; // TODO: Show a proper error ui  
  }

  const handleSave = async () => {
    const mutationBody: Record<string, string> = {
      teamId,
    };
    if (selectedTeamLeadId) {
      mutationBody.teamLeadId = selectedTeamLeadId;
    }

    runWithSaving(async () => {
      const result = await changeTeamLeadMutation(mutationBody);
      if (result.error) {
        toast.error(`Failed to change team lead: ${result.error}`);
      } else {
        onSuccess();
      }
    });
  };

  const members = teamMembersQuery.data;
  const initialTeamLeadId = members.find((member) => member.role === "team_lead")?.userId;
  const hasChanges = selectedTeamLeadId && selectedTeamLeadId !== initialTeamLeadId;

  return (
    <>
      <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
        {members.map((member) => (
          <TeamMemberItem
            key={member._id}
            member={member}
            selected={(selectedTeamLeadId ?? initialTeamLeadId) === member.userId}
            onClick={() => setSelectedTeamLeadId(member.userId)}
          />
        ))}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </>
  );
}

function TeamMemberItem({ member, selected, onClick }: { member: TeamMemberWithUser, selected: boolean, onClick: () => void }) {
  return (
    <div
      className={cn(
        "flex justify-between items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer",
        selected
          ? "bg-primary/10 border-primary hover:bg-primary/15"
          : "border-transparent hover:bg-slate-100 hover:border-slate-200"
      )}
      onClick={onClick}
    >
      <UserSummary user={member.user} enableCopy={false} />
      {selected && (
        <Check className="h-5 w-5 text-primary" />
      )}
    </div>
  )
}