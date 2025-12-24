import {
  action,
  ActionCtx,
  internalMutation,
  internalQuery,
  query,
} from "@convex/_generated/server";
import { fakerEN } from "@faker-js/faker";
import { internal } from "@convex/_generated/api";
import { Doc, Id } from "@convex/_generated/dataModel";
import { v } from "convex/values";
import { vUserRole } from "@convex/schema";
import { createClerkUser } from "@convex/services/clerk";
import { INITIAL_USERS_PASSWORD, ROLES } from "@convex/utils/constants";
import { Result } from "./utils/types";
import { requireRole } from "./utils/auth";

function randomUser(): Omit<
  Doc<"users">,
  "_id" | "_creationTime" | "accountId" | "clerkUserId"
> {
  const firstName = fakerEN.person.firstName();
  const lastName = fakerEN.person.lastName();
  return {
    name: `${firstName} ${lastName}`,
    email: fakerEN.internet.email({
      firstName,
      lastName,
    }),
    avatarUrl: fakerEN.image.avatar(),
    role: fakerEN.helpers.arrayElement(ROLES),
    updatedAt: fakerEN.date.past().getTime(),
    isOnline: fakerEN.datatype.boolean(),
  };
}

function randomPassword(): string {
  const charset = "!@#$%^&*()0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from({ length: 8 }, () => charset[Math.floor(Math.random() * charset.length)]).join("");
}

export const getUsersByAccountId = internalQuery({
  args: {
    accountId: v.id("accounts"),
  },
  handler: async (ctx, args) : Result<Doc<"users">[]> => {
    const users = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("accountId"), args.accountId))
      .collect();
    return { data: users, error: null };
  },
});

export const getUsers = query({
  args: {
    accountToken: v.string(),
  },
  handler: async (ctx, args) : Result<Doc<"users">[], "NOT_AUTHENTICATED" | "NOT_AUTHORIZED" | "UNEXPECTED_ERROR"> => {
    const { data: account } = await ctx.runQuery(internal.account.getAccountByToken, {
      accountToken: args.accountToken,
    });
    if (!account) {
      return { data: null, error: "NOT_AUTHENTICATED" };
    }

    const identityError = (await requireRole(ctx, ["CTO"])).error;
    if (identityError) {
      return { data: null, error: identityError };
    }

    const { data: users } = await ctx.runQuery(internal.user.getUsersByAccountId, {
      accountId: account._id,
    });
    return { data: users, error: null };
  },
});

export const deleteUser = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) : Result<void, "UNEXPECTED_ERROR"> => {
    const result = await ctx.db.delete("users", args.userId);
    return { data: result, error: null };
  },
});

export const createUserService = internalMutation({
  args: {
    accountId: v.id("accounts"),
    user: v.object({
      name: v.string(),
      email: v.string(),
      avatarUrl: v.string(),
      role: vUserRole,
      updatedAt: v.number(),
      isOnline: v.boolean(),
      clerkUserId: v.string(),
    }),
  },
  handler: async (ctx, args) : Result<Id<"users">> => {
    const userId = await ctx.db.insert("users", {
      ...args.user,
      accountId: args.accountId,
    });
    return { data: userId, error: null };
  },
});

export const initializeUsers = async (
  ctx: ActionCtx,
  accountId: Doc<"accounts">["_id"]
) : Result<void> => {
  const initialUsers = [
    {
      ...randomUser(),
      role: "CTO" as const,
    },
    {
      ...randomUser(),
      role: "Product Manager" as const,
    },
    ...Array.from({ length: 9 }).map(() => randomUser()),
  ];

  await Promise.all(
    initialUsers.map(async (user) => {
      const { data: { id: clerkUserId, avatarUrl } } = await createClerkUser({
        ...user,
        password: INITIAL_USERS_PASSWORD,
      });
      await ctx.runMutation(internal.user.createUserService, {
        accountId: accountId,
        user: {
          ...user,
          clerkUserId: clerkUserId,
          avatarUrl
        },
      });
    })
  );

  return { data: undefined, error: null };
};

export const createUser = action({
  args: {
    accountToken: v.string(),
    user: v.object({
      name: v.string(),
      email: v.string(),
      role: vUserRole
    }),
  },
  handler: async (ctx, args) : Result<string, "NOT_AUTHENTICATED" | "NOT_AUTHORIZED" | "UNEXPECTED_ERROR"> => {
    const { data: account } = await ctx.runQuery(internal.account.getAccountByToken, {
      accountToken: args.accountToken,
    });
    if (!account) {
      return { data: null, error: "NOT_AUTHENTICATED" };
    }

    const identityError = (await requireRole(ctx, ["CTO"])).error;
    if (identityError) {
      return { data: null, error: identityError };
    }

    const password = randomPassword()
    const newUser = {
      name: args.user.name,
      email: args.user.email,
      role: args.user.role,
      updatedAt: Date.now(),
      isOnline: false,
    };
    const { data: clerkUser } = await createClerkUser({
      name: args.user.name,
      email: args.user.email,
      password: password,
      role: args.user.role,
    });
    await ctx.runMutation(internal.user.createUserService, {
      accountId: account._id,
      user: {
        ...newUser,
        clerkUserId: clerkUser.id,
        avatarUrl: clerkUser.avatarUrl,
      },
    });
    return { data: password, error: null };
  },
});
