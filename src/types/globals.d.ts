import "convex/server";
import { ROLES } from "@convex/utils/constants"
import { Id } from "@convex/_generated/dataModel";

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
    convexUserId: Id<"users">;
  }
}
