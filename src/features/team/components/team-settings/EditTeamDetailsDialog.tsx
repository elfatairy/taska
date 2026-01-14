import { Dialog, DialogTitle, DialogHeader, DialogContent } from "@/common/components/ui/dialog";
import { useEditTeamForm } from "@/features/team/hooks/useEditTeamForm";
import type { TeamDetail } from "@/features/team/types";
import { api } from "@convex/_generated/api";
import { useAccountQuery } from "@/common/hooks/useAccount";
import { useSearchParams } from "next/navigation";
import { useDialogSearchParams } from "@/common/hooks/useDialogSearchParams";
import { EditTeamDetailsSkeleton } from "./EditTeamDetailsSkeleton";
import { EditTeamDetailsSuccess } from "./EditTeamDetailsSuccess";

export function useShouldOpenEditTeamDetailsDialog(teamSlug?: TeamDetail['slug']) {
  const searchParams = useSearchParams();
  return searchParams.get("modal") === "edit-team-details" && (!teamSlug || searchParams.get("team-slug") === teamSlug);
}

export function EditTeamDetailsDialog({
  team,
  open,
  onClose,
}: {
  team: TeamDetail,
  open: boolean,
  onClose: () => void,
}) {
  const { handleUrlParams } = useDialogSearchParams({
    "modal": "edit-team-details",
    "team-slug": team.slug,
  }, open);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
    handleUrlParams(open);
  }

  function handleClose() {
    onClose();
    handleUrlParams(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Team Details</DialogTitle>
        </DialogHeader>

        <EditTeamDetailsForm team={team} onClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
}

function EditTeamDetailsForm({ team, onClose }: { team: TeamDetail; onClose: () => void }) {
  const { form, successData, error } = useEditTeamForm({ team });
  const teamMembersQuery = useAccountQuery(api.team.getTeamMembers, {
    teamId: team._id,
  });

  if (!teamMembersQuery) {
    return <EditTeamDetailsSkeleton />;
  }

  if (teamMembersQuery.error) {
    return <div>Error: {teamMembersQuery.error}</div>; // TODO: Show a proper error ui  
  }

  if (successData) {
    return <EditTeamDetailsSuccess onClose={onClose} />;
  }

  const teamMembers = teamMembersQuery.data;
  const teamLeadOptions = [
    {
      label: "None",
      value: "none",
    },
    ...teamMembers.map((member) => ({
      label: member.user.name,
      value: member.user._id,
    }))
  ];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="grid gap-4 py-4"
    >
      {error && <div className="text-red-500 text-sm">{error}</div> /** TODO: Show a proper error ui */}
      <form.AppField name="name">
        {(field) => <field.TextField label="Name" placeholder="Enter a name for the team" />}
      </form.AppField>
      <form.AppField name="description">
        {(field) => <field.TextArea label="Description" placeholder="Describe the team in a few sentences" />}
      </form.AppField>
      <form.AppField name="slug">
        {(field) => <field.TextField label="Slug" placeholder="Enter a slug for the team" />}
      </form.AppField>
      <form.AppField name="teamLeadId">
        {(field) => <field.Combobox label="Team Lead" options={teamLeadOptions} placeholder="Select a team lead" />}
      </form.AppField>
      <form.AppForm>
        <form.SubscribeButton label="Save" loadingLabel="Saving..." />
      </form.AppForm>
    </form>
  );
}