import { v } from "convex/values";
import { internal } from "@convex/_generated/api";
import { internalQuery } from "@convex/_generated/server";
import { Doc } from "@convex/_generated/dataModel";
import { action } from "@convex/_generated/server";
import { createSignInToken, verifyUserPassword } from "@convex/services/clerk";
import { Result } from "@convex/utils/types";

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
  handler: async (ctx, args) : Result<Doc<"users">[], "NOT_AUTHENTICATED"> => {
    const { data: account } = await ctx.runQuery(internal.account.getAccountByToken, {
      accountToken: args.accountToken,
    });
    if (!account) {
      return { data: null, error: "NOT_AUTHENTICATED" };
    }

    const users: Doc<"users">[] = await ctx.db
      .query("users")
      .filter((q) =>
        q.and(
          q.eq(q.field("role"), args.role),
          q.eq(q.field("accountId"), account._id)
        )
      )
      .collect();

    return { data: users, error: null };
  },
});

export const getUserByEmail = internalQuery({
  args: {
    email: v.string(),
    accountToken: v.string(),
  },
  handler: async (ctx, args) : Result<Doc<"users"> | null, "ACCOUNT_NOT_FOUND"> => {
    const { data: account } = await ctx.runQuery(internal.account.getAccountByToken, {
      accountToken: args.accountToken,
    });
    if (!account) {
      return { data: null, error: "ACCOUNT_NOT_FOUND" };
    }
    const user = await ctx.db
      .query("users")
      .filter((q) =>
        q.and(
          q.eq(q.field("email"), args.email),
          q.eq(q.field("accountId"), account._id)
        )
      )
      .unique();

    return { data: user, error: null };
  },
});

export const loginWithRole = action({
  args: {
    role: vLoginRole,
    accountToken: v.string(),
  },
  handler: async (ctx, args) : Result<{ token: string }, "NOT_AUTHENTICATED" | "ROLE_NOT_FOUND_IN_ACCOUNT" | "UNEXPECTED_ERROR"> => {
    const { data: users, error: usersError } = await ctx.runQuery(internal.auth.getUsersByRole, {
      role: args.role,
      accountToken: args.accountToken,
    });
    if (usersError) {
      return { data: null, error: usersError };
    }
    if (!users[0]) {
      return { data: null, error: "ROLE_NOT_FOUND_IN_ACCOUNT" };
    }

    const { data: signInToken } = await createSignInToken(users[0].clerkUserId);
    return { data: { token: signInToken }, error: null };
  },
});

export const login = action({
  args: {
    email: v.string(),
    password: v.string(),
    accountToken: v.string(),
  },
  handler: async (ctx, args): Result<{ token: string }, "INVALID_EMAIL_OR_PASSWORD" | "UNEXPECTED_ERROR" | "ACCOUNT_NOT_FOUND"> => {
    const { data: user, error: userError } = await ctx.runQuery(internal.auth.getUserByEmail, {
      email: args.email,
      accountToken: args.accountToken,
    });
    if (userError) {
      return { data: null, error: userError };
    }
    if (!user) {
      return { data: null, error: "INVALID_EMAIL_OR_PASSWORD" };
    }

    const { data: verifiedPassword } = await verifyUserPassword(
      user.clerkUserId,
      args.password
    );
    if (!verifiedPassword) {
      return { data: null, error: "INVALID_EMAIL_OR_PASSWORD" };
    }

    const { data: signInToken } = await createSignInToken(user.clerkUserId);
    return { data: { token: signInToken }, error: null };
  },
});