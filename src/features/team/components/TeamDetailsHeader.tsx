import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import Link from "next/link";
import { useAccountQuery } from "@/features/account/useAccount";
import { api } from "@convex/_generated/api";
import { TeamDetailsHeaderLoading } from "./TeamDetailsLoading";
import { EditTeamDetailsDialog } from "./EditTeamDetailsDialog";

export function TeamDetailsHeader({ teamSlug }: { teamSlug: string }) {
  const teamQuery = useAccountQuery(api.team.getTeamBySlug, {
    teamSlug,
  });

  if (!teamQuery) {
    return <TeamDetailsHeaderLoading />;
  }

  if (teamQuery.error) {
    return <div>Error: {teamQuery.error}</div>;
  }

  const team = teamQuery.data;

  return (
    <div className="flex justify-between items-center">
      <TeamDetailsBreadcrumb teamName={team.name} />
      <div className="flex gap-2">
        <EditTeamDetailsDialog team={team} />
      </div>
    </div>
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