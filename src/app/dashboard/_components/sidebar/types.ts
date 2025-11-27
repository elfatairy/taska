import type { IconType } from "@/types/icon-type";

export type Route = {
  label: string;
  href: string;
  icon?: IconType;
  children?: Route[];
};
