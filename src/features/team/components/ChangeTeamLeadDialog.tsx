import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Team, TeamMember } from "@/features/team/types";
import { api } from "@convex/_generated/api";
import { useAccountQuery, useAccountMutation } from "@/features/account/useAccount";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useWithLoading } from "@/hooks/useWithLoading";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function ChangeTeamLeadDialog({ children, teamId, initialTeamLeadId }: { children: React.ReactNode, teamId: Team['_id'], initialTeamLeadId?: TeamMember['userId'] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  const [open, setOpen] = useState(searchParams.get("modal") === "change-team-lead");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => setShowSuccess(false), 3000);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    const params = new URLSearchParams(searchParams.toString());

    if (isOpen) {
      params.set("modal", "change-team-lead");
      setShowSuccess(false);
    } else {
      params.delete("modal");
      setShowSuccess(false);
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

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

        {showSuccess ? (
          <ChangeTeamLeadDialogSuccessState onClose={handleClose} />
        ) : (
          <ChangeTeamLeadDialogContent
            teamId={teamId}
            initialTeamLeadId={initialTeamLeadId}
            onSuccess={() => setShowSuccess(true)}
            onCancel={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ChangeTeamLeadDialogContent({
  teamId,
  initialTeamLeadId,
  onSuccess,
  onCancel,
}: {
  teamId: Team['_id'];
  initialTeamLeadId?: TeamMember['userId'];
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const teamMembersQuery = useAccountQuery(api.team.getTeamMembers, {
    teamId: teamId,
  });
  const changeTeamLeadMutation = useAccountMutation(api.team.changeTeamLead);

  const [selectedTeamLeadId, setSelectedTeamLeadId] = useState<TeamMember['userId'] | undefined>(initialTeamLeadId);
  const { isLoading: isSaving, runWithLoading: runWithSaving } = useWithLoading();

  if (!teamMembersQuery) {
    return <ChangeTeamLeadDialogLoadingState />;
  }

  if (teamMembersQuery?.error) {
    return <div>Error: {teamMembersQuery.error}</div>; // TODO: Show a proper error ui  
  }

  const members = teamMembersQuery.data;
  const hasChanges = selectedTeamLeadId !== initialTeamLeadId;

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

  return (
    <>
      <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
        {members.map((member) => (
          <TeamMemberItem
            key={member._id}
            member={member}
            selected={selectedTeamLeadId === member.userId}
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

function TeamMemberItem({ member, selected, onClick }: { member: TeamMember, selected: boolean, onClick: () => void }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer",
        selected
          ? "bg-primary/10 border-primary hover:bg-primary/15"
          : "border-transparent hover:bg-slate-100 hover:border-slate-200"
      )}
      onClick={onClick}
    >
      <Avatar>
        <AvatarImage src={member.user.imageUrl} alt={member.user.name} />
        <AvatarFallback>{member.user.name.split(" ").map(name => name[0]).join("")}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col flex-1">
        <p className="text-sm font-medium">{member.user.name}</p>
        <p className="text-xs text-muted-foreground">{member.user.email}</p>
      </div>
      {selected && (
        <Check className="h-5 w-5 text-primary flex-shrink-0" />
      )}
    </div>
  )
}

export function ChangeTeamLeadDialogTrigger({ children }: { children: React.ReactNode }) {
  return (
    <DialogTrigger asChild>
      {children}
    </DialogTrigger>
  )
}

function ChangeTeamLeadDialogSuccessState({ onClose }: { onClose: () => void }) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) {
      onClose();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onClose]);

  return (
    <div className="flex flex-col items-center text-center py-6 gap-4">
      <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Team Lead Updated Successfully!</h3>
        <p className="text-sm text-muted-foreground">
          Closing in {countdown} second{countdown !== 1 ? 's' : ''}...
        </p>
      </div>
      <Button onClick={onClose} variant="outline" className="mt-2">
        Close Now
      </Button>
    </div>
  );
}

function ChangeTeamLeadDialogLoadingState() {
  return (
    <>
      <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
        {[1, 2, 3, 4, 5].map((index) => (
          <div key={index} className="flex items-center gap-3 p-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-col gap-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
      <DialogFooter>
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-28" />
      </DialogFooter>
    </>
  );
}