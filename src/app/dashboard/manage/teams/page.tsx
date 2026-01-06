'use client'

import { useConvexAuth } from "convex/react";
import TeamsPageLoading from "@/app/dashboard/manage/teams/loading";
import { Block } from "@/features/layout/components/Block";
import { redirect } from "next/navigation";
import { teamsTableColumns } from "@/features/team/components/TeamsTableColumns";
import { TeamsTable } from "@/features/team/components/TeamsTable";

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
