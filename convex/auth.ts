import { v } from "convex/values";
import { internal } from "@convex/_generated/api";
import { internalQuery } from "@convex/_generated/server";
import { ConvexError } from "convex/values";
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
  handler: async (ctx, args) => {
    const account = await ctx.runQuery(internal.account.getAccountByToken, {
      accountToken: args.accountToken,
    });
    if (!account) {
      throw new ConvexError("Account not found");
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

    return users;
  },
});

export const getUserByEmail = internalQuery({
  args: {
    email: v.string(),
    accountToken: v.string(),
  },
  handler: async (ctx, args) => {
    const account = await ctx.runQuery(internal.account.getAccountByToken, {
      accountToken: args.accountToken,
    });
    if (!account) {
      throw new ConvexError("Account not found");
    }
    const userPromise: Promise<Doc<"users"> | null> = ctx.db
      .query("users")
      .filter((q) =>
        q.and(
          q.eq(q.field("email"), args.email),
          q.eq(q.field("accountId"), account._id)
        )
      )
      .unique();

    return await userPromise;
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

export const login = action({
  args: {
    email: v.string(),
    password: v.string(),
    accountToken: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<Result<{ token: string }, "INVALID_EMAIL_OR_PASSWORD" | "UNEXPECTED_ERROR">> => {
    try {
      const user = await ctx.runQuery(internal.auth.getUserByEmail, {
        email: args.email,
        accountToken: args.accountToken,
      });
      if (!user) {
        return { data: null, error: "INVALID_EMAIL_OR_PASSWORD" };
      }
      const verifiedPassword = await verifyUserPassword(
        user.clerkUserId,
        args.password
      );
      if (!verifiedPassword) {
        return { data: null, error: "INVALID_EMAIL_OR_PASSWORD" };
      }
      const signInToken = await createSignInToken(user.clerkUserId);
      return { data: { token: signInToken }, error: null };
    } catch (error) {
      console.error(error);
      return { data: null, error: "UNEXPECTED_ERROR" };
    }
  },
});
