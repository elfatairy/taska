"use client";

import { redirect } from "next/navigation";
import TeamDetailsPageLoading from "./loading";
import { useConvexAuth } from "convex/react";
import { use } from "react";

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
    <div className="h-full flex items-center justify-center pb-16">
      Team
    </div>
  )
}