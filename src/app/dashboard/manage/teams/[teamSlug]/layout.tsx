'use client';

import { AwaitParams } from "@/common/components/AwaitParams";
import { TeamDetailsHeader } from "@/features/team/components/team-details/TeamDetailsHeader";
import { TeamDetailsHeaderSkeleton } from "@/features/team/components/team-details/TeamDetailsSkeleton";
import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default function TeamLayout({ children, params }: LayoutProps<'/dashboard/manage/teams/[teamSlug]'>) {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (!isLoading && !isAuthenticated) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-2 p-6">
      {
        isLoading ? (
          <TeamDetailsHeaderSkeleton />
        ) : (
          <Suspense fallback={<TeamDetailsHeaderSkeleton />}>
            <AwaitParams params={params}>
              {({ teamSlug }) => (
                <TeamDetailsHeader teamSlug={teamSlug} />
              )}
            </AwaitParams>
          </Suspense>
        )
      }
      {children}
    </div>
  )
}