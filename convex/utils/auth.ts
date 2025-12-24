import { ActionCtx, QueryCtx } from "@convex/_generated/server";
import { Result } from "./types";
import { UserIdentity } from "convex/server";
import { ROLES } from "./constants";

export const requireRole = async (
  ctx: QueryCtx | ActionCtx,
  requiredRoles: string[]
): Result<UserIdentity, "NOT_AUTHENTICATED" | "NOT_AUTHORIZED"> => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity || !identity.subject) {
    return { data: null, error: "NOT_AUTHENTICATED" };
  }
  const role = identity.role;
  if (!role || !requiredRoles.includes(role as (typeof ROLES)[number])) {
    return { data: null, error: "NOT_AUTHORIZED" };
  }

  return { data: identity, error: null };
};
