import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import Link from "next/link";

export function TeamDetailsLoading() {
  return (
    <div className="flex flex-col gap-2 p-6">
      <div className="flex justify-between items-center">
        <TeamDetailsBreadcrumbLoading />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-40" />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex flex-7 flex-col gap-4">
          <TeamDetailsMembersCardLoading />
          <TeamDetailsProjectsCardLoading />
        </div>

        <div className="flex flex-3 flex-col gap-4">
          <TeamDetailsAboutCardLoading />
          <TeamDetailsStatsCardLoading />
        </div>
      </div>
    </div>
  );
}

export function TeamDetailsBreadcrumbLoading() {
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

export function TeamDetailsMembersCardLoading() {
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
            <TeamDetailsMemberItemLoading key={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TeamDetailsMemberItemLoading() {
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

export function TeamDetailsProjectsCardLoading() {
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
            <TeamDetailsProjectItemLoading key={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TeamDetailsProjectItemLoading() {
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

export function TeamDetailsAboutCardLoading() {
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

export function TeamDetailsStatsCardLoading() {
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
