"use client"

import { useUser } from "@clerk/nextjs";
import { SidebarNavSkeleton } from "./SidebarSkeleton";
import { SidebarPM } from "./SidebarPM";
import { SidebarCTO } from "./SidebarCTO";
import { SidebarUser } from "./SidebarUser";
import { useUserRole } from "@/hooks/useUserRole";

export function SidebarNav() {
  const userRole = useUserRole();
  const { isLoaded } = useUser();

  if (!isLoaded) {
    return <SidebarNavSkeleton />;
  }

  if (userRole === "CTO") {
    return <SidebarCTO />;
  } else if (userRole === "Product Manager") {
    return <SidebarPM />;
  } else {
    return <SidebarUser />;
  }
}