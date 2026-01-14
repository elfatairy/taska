import { useAccountQuery } from "@/common/hooks/useAccount";
import { api } from "@convex/_generated/api";
import { TeamDetailsSkeleton } from "@/features/team/components/team-details/TeamDetailsSkeleton";
import { TeamDetailsMembersCard } from "@/features/team/components/team-details/TeamDetailsMembers";
import { TeamDetailsProjectsCard } from "@/features/team/components/team-details/TeamDetailsProjects";
import { TeamDetailsAboutCard, TeamDetailsStatsCard } from "@/features/team/components/team-details/TeamDetailsAbout";

export function TeamDetails({ teamSlug }: { teamSlug: string }) {
  const teamQuery = useAccountQuery(api.team.getTeamBySlug, {
    teamSlug,
  });

  if (!teamQuery) {
    return <TeamDetailsSkeleton />
  }

  if (teamQuery.error) {
    return <div>Error: {teamQuery.error}</div>
  }

  const team = teamQuery.data;

  return (
    <div className="flex gap-4">
      <div className="flex flex-7 flex-col gap-4">
        <TeamDetailsMembersCard teamId={team._id} />
        <TeamDetailsProjectsCard teamId={team._id} />
      </div>

      <div className="flex flex-3 flex-col gap-4">
        <TeamDetailsAboutCard description={team.description} teamLead={team.teamLead} teamId={team._id} />
        <TeamDetailsStatsCard team={team} />
      </div>
    </div>
  )
}