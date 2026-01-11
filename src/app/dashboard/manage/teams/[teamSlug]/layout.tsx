'use client';

import { AwaitParams } from "@/components/AwaitParams";
import { TeamDetailsHeader } from "@/features/team/components/TeamDetailsHeader";
import { TeamDetailsHeaderLoading } from "@/features/team/components/TeamDetailsLoading";
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
          <TeamDetailsHeaderLoading />
        ) : (
          <Suspense fallback={<TeamDetailsHeaderLoading />}>
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