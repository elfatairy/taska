"use client"

import { SidebarRoutes } from "./SidebarRoutes";
import { api } from "@convex/_generated/api";
import { useAccountQuery } from "@/common/hooks/useAccount";
import { SidebarNavSkeleton } from "@/common/layout/sidebar/components/SidebarSkeleton";
import { getProjectIcon } from "@/features/project/utils";

export function SidebarCTO() {
  const projectsQuery = useAccountQuery(api.project.getProjects);

  if (!projectsQuery) return <SidebarNavSkeleton />;

  if (projectsQuery.error) {
    throw new Error(projectsQuery.error);
  }

  const routes = [
    {
      label: "Primary Navigation",
      routes: [
        {
          label: "Overview",
          href: "/dashboard",
          icon: "ChartPie" as const,
        },
        {
          label: "Projects",
          href: "/dashboard/projects",
          icon: "DocumentReport" as const,
          children: [
            ...projectsQuery.data.map((project) => ({
              label: project.name,
              href: `/dashboard/projects/${project.slug}`,
              icon: getProjectIcon(project.type),
            })),
            {
              label: "New Project",
              href: "/dashboard/projects/new",
              icon: "PlusCircle" as const,
            },
          ],
        },
        {
          label: "Favorites",
          href: "/dashboard/favorites",
          icon: "Heart" as const,
          children: [],
        },
        {
          label: "Manage",
          icon: "ClipboardList" as const,
          children: [
            {
              label: "Users",
              href: "/dashboard/manage/users",
            },
            {
              label: "Teams",
              href: "/dashboard/manage/teams",
            },
            {
              label: "Notifications",
              href: "/dashboard/manage/notifications",
            },
          ],
        },
        {
          label: "Direct Messages",
          href: "/dashboard/direct-messages",
          icon: "InboxIn" as const,
          children: [],
        },
      ],
    },
    {
      label: "Account & Settings",
      routes: [
        {
          label: "Settings",
          href: "/dashboard/settings",
          icon: "DoubleGear" as const,
        },
      ],
    },
  ]

  return (
    <SidebarRoutes routes={routes} />
  )
}