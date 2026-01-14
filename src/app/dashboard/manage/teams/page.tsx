'use client'

import { useConvexAuth } from "convex/react";
import TeamsPageLoading from "@/app/dashboard/manage/teams/loading";
import { Block } from "@/common/layout/Block";
import { redirect } from "next/navigation";
import { teamsTableColumns } from "@/features/team/components/team-list/TeamsTableColumns";
import { TeamsTable } from "@/features/team/components/team-list/TeamsTable";

export default function TeamsPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <TeamsPageLoading />;
  }

  if (!isAuthenticated) {
    redirect("/login");
  }

  return (
    <Block>
      <TeamsTable columns={teamsTableColumns} />
    </Block>
  );
}
