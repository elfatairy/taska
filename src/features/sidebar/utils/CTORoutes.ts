import { SidebarNav } from "../types";

export const CTORoutes: SidebarNav = [
  {
    label: "Primary Navigation",
    routes: [
      {
        label: "Overview",
        href: "/dashboard",
        icon: "ChartPie",
      },
      {
        label: "Projects",
        href: "/dashboard/projects",
        icon: "DocumentReport",
        children: [
          {
            label: "New Project",
            href: "/dashboard/projects/new",
          },
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
            label: "Users",
            href: "/dashboard/manage/users",
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