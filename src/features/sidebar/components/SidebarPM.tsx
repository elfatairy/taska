"use client"

import { useAccountQuery } from "@/features/account/useAccount";
import type { SidebarNav } from "../types";
import { api } from "@convex/_generated/api";
import { SidebarNavSkeleton } from "@/features/sidebar/components/SidebarSkeleton";
import { SidebarRoutes } from "@/features/sidebar/components/SidebarRoutes";
import { getProjectIcon } from "@/features/project/utils/getProjectIcon";

export function SidebarPM() {
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
          icon: "ChartPie",
          children: [
            {
              label: "Calendar",
              href: "/dashboard/calendar"
            },
            {
              label: "Kanban",
              href: "/dashboard/kanban"
            }
          ],
        },
        {
          label: "Projects",
          href: "/dashboard/projects",
          icon: "DocumentReport",
          children: [
            ...projectsQuery.data.map((project) => ({
              label: project.name,
              href: `/dashboard/projects/${project.slug}`,
              icon: getProjectIcon(project.type),
              children: [
                {
                  label: "Discussions",
                  href: `/dashboard/projects/${project.slug}/discussions`,
                },
                {
                  label: "Sprints",
                  href: `/dashboard/projects/${project.slug}/sprints`,
                },
                {
                  label: "Teams",
                  href: `/dashboard/projects/${project.slug}/teams`,
                },
              ],
            })),
          ]
        },
        {
          label: "Favorites",
          href: "/dashboard/favorites",
          icon: "Heart",
          children: [],
        },
        {
          label: "Manage",
          icon: "ClipboardList",
          children: [
            {
              label: "Teams",
              href: "/dashboard/manage/teams",
            },
            {
              label: "Active Issues",
              href: "/dashboard/manage/active-issues",
            }
          ],
        },
        {
          label: "Direct Messages",
          href: "/dashboard/direct-messages",
          icon: "InboxIn",
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
          icon: "DoubleGear",
        },
      ],
    },
  ] satisfies SidebarNav

  return (
    <SidebarRoutes routes={routes} />
  )
}