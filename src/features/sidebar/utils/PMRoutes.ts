import { SidebarNav } from "../types";

export const PMRoutes: SidebarNav = [
  {
    label: "Projects",
    showLabel: true,
    routes: [
      {
        label: "Mobile App v2",
        href: "/dashboard/projects/mobile-app-v2",
        children: [
          {
            label: "Discussions",
            href: "/dashboard/projects/mobile-app-v2/discussions",
          },
          {
            label: "Sprints",
            href: "/dashboard/projects/mobile-app-v2/sprints",
          },
          {
            label: "Teams",
            href: "/dashboard/projects/mobile-app-v2/teams",
          },
        ],
      },
      {
        label: "Mobile App v3",
        href: "/dashboard/projects/mobile-app-v3",
        children: [
          {
            label: "Discussions",
            href: "/dashboard/projects/mobile-app-v3/discussions",
          },
          {
            label: "Sprints",
            href: "/dashboard/projects/mobile-app-v3/sprints",
          },
          {
            label: "Teams",
            href: "/dashboard/projects/mobile-app-v3/teams",
          },
        ],
      }
    ]
  },
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
]