import { Dialog, DialogTitle, DialogHeader, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, EditIcon } from "lucide-react";
import { useEditTeamForm } from "../hooks/useEditTeamForm";
import { Team } from "@/features/team/types";
import { api } from "@convex/_generated/api";
import { useAccountQuery } from "@/features/account/useAccount";
import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function EditTeamDetailsDialog({ team }: { team: Team }) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(searchParams.get("modal") === "edit-team-details");

  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    const params = new URLSearchParams(searchParams.toString())

    if (open) {
      params.set("modal", "edit-team-details")
    } else {
      params.delete("modal")
    }

    router.replace(`${pathname}?${params.toString()}`)
  }

  function handleClose() {
    setOpen(false)
    const params = new URLSearchParams(searchParams.toString())

    params.delete("modal")
    const newPathname = team.previous_slug ? pathname.replace(team.previous_slug, team.slug) : pathname;
    router.replace(`${newPathname}?${params.toString()}`)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="border border-slate-300">
          <EditIcon className="w-4 h-4" />
          Edit Team Details
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Team Details</DialogTitle>
        </DialogHeader>

        <EditTeamDetailsForm team={team} onClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
}

function EditTeamDetailsForm({ team, onClose }: { team: Team; onClose: () => void }) {
  const { form, successData } = useEditTeamForm({ team });
  const teamMembersQuery = useAccountQuery(api.team.getTeamMembers, {
    teamId: team._id,
  });

  if (!teamMembersQuery) {
    return <EditTeamDetailsFormLoading />;
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

function EditTeamDetailsSuccess({ onClose }: { onClose: () => void }) {
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
        <h3 className="text-lg font-semibold">Team Updated Successfully!</h3>
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

function EditTeamDetailsFormLoading() {
  return (
    <div className="grid gap-4 py-4">
      {/* Name field */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-10 w-full" />
      </div>
      {/* Description field */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-24 w-full" />
      </div>
      {/* Slug field */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-10 w-full" />
      </div>
      {/* Team Lead combobox */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      {/* Submit button */}
      <Skeleton className="h-10 w-full mt-2" />
    </div>
  );
}