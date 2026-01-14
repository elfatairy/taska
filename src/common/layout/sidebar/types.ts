import type { IconType } from "@/types/icon-type";

export type SidebarRoute = {
  label: string;
  href?: string;
  icon?: IconType;
  children?: SidebarRoute[];
};

type SidebarNavGroup = {
  label: string;
  showLabel?: boolean;
  icon?: IconType;
  routes?: SidebarRoute[];
}

export type SidebarNav = SidebarNavGroup[]