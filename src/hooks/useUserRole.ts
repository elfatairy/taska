import { Role } from "@/features/auth/types";
import { useUser } from "@clerk/nextjs";

export function useUserRole() {
  const user = useUser();
  return user.user?.publicMetadata.role as Role['value'];
}