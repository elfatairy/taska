import { SidebarNav } from "../types";

export const UserRoutes: SidebarNav = [
  {
    label: "Primary Navigation",
    routes: [
      {
        label: "Tasks",
        href: "/dashboard/tasks",
        icon: "ListCheck",
        children: [
        ]
      },
      {
        label: "Discussions",
        href: "/dashboard/discussions",
        icon: "MessageCircle",
        children: [
          {
            label: "New Discussion",
            href: "/dashboard/discussions/new",
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