"use client"

import { useUser } from "@clerk/nextjs";
import { SidebarNavSkeleton } from "./SidebarSkeleton";
import { SidebarPM } from "./SidebarPM";
import { SidebarCTO } from "./SidebarCTO";
import { SidebarUser } from "./SidebarUser";

export function SidebarNav() {
  const { user, isLoaded } = useUser();
  const role = user?.publicMetadata.role as string;

  if (!isLoaded) {
    return <SidebarNavSkeleton />;
  }

  if (role === "CTO") {
    return <SidebarCTO />;
  } else if (role === "Product Manager") {
    return <SidebarPM />;
  } else {
    return <SidebarUser />;
  }
}