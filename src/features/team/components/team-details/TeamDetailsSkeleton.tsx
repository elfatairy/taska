import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Skeleton } from "@/common/components/ui/skeleton";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/common/components/ui/breadcrumb";
import Link from "next/link";
import { Button } from "@/common/components/ui/button";
import { EditIcon } from "lucide-react";

export function TeamDetailsSkeleton() {
  return (
    <div className="flex gap-4">
      <div className="flex flex-7 flex-col gap-4">
        <TeamDetailsMembersCardSkeleton />
        <TeamDetailsProjectsCardSkeleton />
      </div>

      <div className="flex flex-3 flex-col gap-4">
        <TeamDetailsAboutCardSkeleton />
        <TeamDetailsStatsCardSkeleton />
      </div>
    </div>
  );
}

export function TeamDetailsHeaderSkeleton() {
  return (
    <div className="flex justify-between items-center">
      <TeamDetailsBreadcrumbSkeleton />
      <div className="flex gap-2">
        <Button variant="ghost" className="border border-slate-300" disabled>
          <EditIcon className="w-4 h-4" />
          Edit Team Details
        </Button>
      </div>
    </div>
  );
}

export function TeamDetailsBreadcrumbSkeleton() {
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
          <Skeleton className="h-4 w-24" />
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function TeamDetailsMembersCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        <CardDescription>View and manage all members in this team</CardDescription>
        <CardAction>
          <Skeleton className="h-8 w-28" />
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          {[1, 2, 3].map((i) => (
            <TeamDetailsMemberItemSkeleton key={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TeamDetailsMemberItemSkeleton() {
  return (
    <div className="flex items-center justify-between gap-2 p-2 rounded-md">
      <div className="flex items-center gap-2">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <Skeleton className="h-8 w-8 rounded-md" />
    </div>
  );
}

export function TeamDetailsProjectsCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Projects</CardTitle>
        <CardDescription>All projects assigned to this team</CardDescription>
        <CardAction>
          <Skeleton className="h-8 w-32" />
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          {[1, 2].map((i) => (
            <TeamDetailsProjectItemSkeleton key={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TeamDetailsProjectItemSkeleton() {
  return (
    <div className="flex items-center justify-between gap-2 p-2 rounded-md">
      <div className="flex items-center gap-2">
        <Skeleton className="size-5 rounded-md" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <Skeleton className="h-8 w-8 rounded-md" />
    </div>
  );
}

export function TeamDetailsAboutCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Information</CardTitle>
        <CardDescription>Team leadership and general information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-sm font-semibold text-muted-foreground">Team Lead</h3>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-md mb-2">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-9 w-full" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground pb-1">Description</h3>
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TeamDetailsStatsCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistics</CardTitle>
        <CardDescription>Quick overview of team metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
