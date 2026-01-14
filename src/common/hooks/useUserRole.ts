import { useUser } from "@clerk/nextjs";
import { UserRole } from "@/common/types";

export function useUserRole() {
  const user = useUser();
  return user.user?.publicMetadata.role as UserRole;
}