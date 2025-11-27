import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalQuery } from "./_generated/server";
import { ConvexError } from "convex/values";
import { Doc } from "./_generated/dataModel";
import { action } from "./_generated/server";
import { createSignInToken } from "./services/clerk";

const vLoginRole = v.union(
  v.literal("Product Manager"),
  v.literal("Team Lead"),
  v.literal("Developer"),
  v.literal("CTO")
);

export const getUsersByRole = internalQuery({
  args: {
    role: vLoginRole,
    accountToken: v.string(),
  },
  handler: async (ctx, args) => {
    const account = await ctx.runQuery(internal.account.getAccountByTokenIdentifier, {
      tokenIdentifier: args.accountToken,
    });
    if (!account) {
      throw new ConvexError("Account not found");
    }
    const users: Doc<"users">[] = await ctx.db
      .query("users")
      .filter(
        (q) =>
          q.eq(q.field("role"), args.role) &&
          q.eq(q.field("accountId"), account._id)
      )
      .collect();
      
    return users;
  },
});

export const loginWithRole = action({
  args: {
    role: vLoginRole,
    accountToken: v.string(),
  },
  handler: async (ctx, args) => {
    const users = await ctx.runQuery(internal.auth.getUsersByRole, {
      role: args.role,
      accountToken: args.accountToken,
    });
    if (!users[0]) {
      throw new ConvexError("There is no user with this role in this account");
    }

    const signInToken = await createSignInToken(users[0].clerkUserId);
    return signInToken;
  },
});
