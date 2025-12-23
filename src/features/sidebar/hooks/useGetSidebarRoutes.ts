import { useUser } from "@clerk/nextjs";
import { CTORoutes } from "@/features/sidebar/utils/CTORoutes";
import { PMRoutes } from "@/features/sidebar/utils/PMRoutes";
import { UserRoutes } from "@/features/sidebar/utils/UserRoutes";
import { SidebarNav } from "../types";

export function useGetSidebarRoutes() {
  const { user } = useUser();
  const role = user?.publicMetadata.role as string;

  let routes: SidebarNav = [];
  
  if (role === "CTO") {
    routes = CTORoutes;
  } else if (role === "Product Manager") {
    routes = PMRoutes;
  } else {
    routes = UserRoutes;
  }

  return routes;
}
