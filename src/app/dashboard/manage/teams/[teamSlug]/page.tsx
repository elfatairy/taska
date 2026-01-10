"use client";

import { redirect } from "next/navigation";
import TeamDetailsPageLoading from "./loading";
import { useConvexAuth } from "convex/react";
import { use } from "react";
import { TeamDetails } from "@/features/team/components/TeamDetails";
import { Block } from "@/features/layout/components/Block";

export default function ManageTeamPage({ params }: PageProps<'/dashboard/manage/teams/[teamSlug]'>) {
  const { teamSlug } = use(params);
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <TeamDetailsPageLoading />;
  }

  if (!isAuthenticated) {
    redirect("/login");
  }


  return (
    <TeamDetails teamSlug={teamSlug} />
  )
}