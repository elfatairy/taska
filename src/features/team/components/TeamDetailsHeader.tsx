import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import Link from "next/link";
import { useAccountQuery } from "@/features/account/useAccount";
import { api } from "@convex/_generated/api";
import { TeamDetailsHeaderLoading } from "./TeamDetailsLoading";
import { EditTeamDetailsDialog, useShouldOpenEditTeamDetailsDialog } from "./EditTeamDetailsDialog";
import { useUserRole } from "@/hooks/useUserRole";
import { EditIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function TeamDetailsHeader({ teamSlug }: { teamSlug: string }) {
  const teamQuery = useAccountQuery(api.team.getTeamBySlug, {
    teamSlug,
  });
  const userRole = useUserRole();
  const shouldOpenEditTeamDetailsDialog = useShouldOpenEditTeamDetailsDialog(teamSlug);
  const [openEditTeamDetailsDialog, setOpenEditTeamDetailsDialog] = useState(shouldOpenEditTeamDetailsDialog);

  function handleOpenEditTeamDetailsDialog() {
    setOpenEditTeamDetailsDialog(true);
  }

  function handleCloseEditTeamDetailsDialog() {
    setOpenEditTeamDetailsDialog(false);
  }

  if (!teamQuery) {
    return <TeamDetailsHeaderLoading />;
  }

  if (teamQuery.error) {
    return <div>Error: {teamQuery.error}</div>;
  }

  const team = teamQuery.data;

  return (
    <>
      <EditTeamDetailsDialog
        team={team}
        open={openEditTeamDetailsDialog}
        onClose={handleCloseEditTeamDetailsDialog}
      />
      <div className="flex justify-between items-center">
        <TeamDetailsBreadcrumb teamName={team.name} />
        {
          userRole === "CTO" && (
            <div className="flex gap-2">
              <Button
                variant="ghost" className="border border-slate-300"
                onClick={handleOpenEditTeamDetailsDialog}
              >
                <EditIcon className="w-4 h-4" />
                Edit Team Details
              </Button>
            </div>
          )
        }
      </div>
    </>
  )
}

function TeamDetailsBreadcrumb({ teamName }: { teamName: string }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard/manage/teams">Teams</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{teamName}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}