import { useUser } from "@clerk/nextjs";
import { CTORoutes } from "@/features/sidebar/utils/CTORoutes";
import { PMRoutes } from "@/features/sidebar/utils/PMRoutes";
import { UserRoutes } from "@/features/sidebar/utils/UserRoutes";
import { SidebarNav } from "../types";

type UseGetSidebarRoutesReturn = {
  routes: SidebarNav;
  isLoaded: true;
} | {
  routes: undefined;
  isLoaded: false;
}

export function useGetSidebarRoutes() : UseGetSidebarRoutesReturn {
  const { user, isLoaded } = useUser();
  const role = user?.publicMetadata.role as string;

  if (!isLoaded) {
    return { routes: undefined, isLoaded: false };
  }

  let routes: SidebarNav = [];
  
  if (role === "CTO") {
    routes = CTORoutes;
  } else if (role === "Product Manager") {
    routes = PMRoutes;
  } else {
    routes = UserRoutes;
  }

  return { routes, isLoaded };
}
