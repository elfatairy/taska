import "convex/server";
import { ROLES } from "@convex/utils/constants"
import { UserId } from "@/common/types";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: (typeof ROLES)[number]
    }
  }
}


declare module "convex/server" {
  interface UserIdentity {
    role?: (typeof ROLES)[number];
    convexUserId: UserId;
  }
}
