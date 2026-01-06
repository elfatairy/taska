import { ActionCtx, QueryCtx } from "@convex/_generated/server";
import { Result } from "./types";
import { UserIdentity } from "convex/server";
import { ROLES } from "./constants";

export const getUserIdentity = async (ctx: QueryCtx | ActionCtx): Result<UserIdentity, "NOT_AUTHENTICATED"> => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity || !identity.subject) {
    return { data: null, error: "NOT_AUTHENTICATED" };
  }
  return { data: identity, error: null };
};

export const requireRole = async (
  ctx: QueryCtx | ActionCtx,
  requiredRoles: string[]
): Result<UserIdentity, "NOT_AUTHENTICATED" | "NOT_AUTHORIZED"> => {
  const { data: identity, error: identityError } = await getUserIdentity(ctx);
  if (identityError) {
    return { data: null, error: identityError };
  }
  const role = identity.role;
  if (!role || !requiredRoles.includes(role as (typeof ROLES)[number])) {
    return { data: null, error: "NOT_AUTHORIZED" };
  }
  return { data: identity, error: null };
};
