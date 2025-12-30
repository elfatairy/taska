'use client';

import Link from "next/link";
import { Icon } from "@/components/Icon";
import { SidebarMenuButton as SidebarMenuButtonBase, SidebarMenuSubButton as SidebarMenuSubButtonBase, useSidebar } from "@/components/ui/sidebar";
import type { SidebarRoute } from "@/features/sidebar/types";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  route: SidebarRoute;
}

export function SidebarMenuButton({ route, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === route.href;

  return (
    <SidebarMenuButtonBase asChild isActive={isActive}>
      <SidebarNavLink route={route} {...props} />
    </SidebarMenuButtonBase>  
  )
}

export function SidebarMenuSubButton({ route, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === route.href;

  return (
    <SidebarMenuSubButtonBase asChild isActive={isActive}>
      <SidebarNavLink route={route} {...props} />
    </SidebarMenuSubButtonBase>
  )
}

const MAX_LENGTH = 16;

const SidebarNavLink = ({ route, ...props }: NavLinkProps) => {
  const { toggleSidebar, isMobile } = useSidebar();
  

  if (!route.href) {
    return (
      <div className="gap-4" {...props}>
        {route.icon && <Icon icon={route.icon} size={20} strokeWidth={0} className="fill-none" />}
        {route.label.length > MAX_LENGTH ? `${route.label.slice(0, MAX_LENGTH)}...` : route.label}
      </div>
    )
  }

  return (
    <Link
      href={route.href}
      className={'gap-4'}
      {...props}
      onClick={() => {
        if (isMobile) {
          toggleSidebar();
        }
      }}
    >
      {route.icon && <Icon icon={route.icon} size={20} strokeWidth={0} className="fill-none" />}
      {route.label.length > MAX_LENGTH ? `${route.label.slice(0, MAX_LENGTH)}...` : route.label}
    </Link>
  )
}