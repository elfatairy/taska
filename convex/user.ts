import {
  action,
  ActionCtx,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { fakerEN } from "@faker-js/faker";
import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import { ConvexError, v } from "convex/values";
import { vUserRole } from "./schema";
import { createClerkUser } from "./services/clerk";
import { INITIAL_USERS_PASSWORD } from "./utils/constants";

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
    role: fakerEN.helpers.arrayElement([
      "Product Manager",
      "Frontend Developer",
      "Backend Developer",
      "Designer",
      "QA",
      "DevOps",
    ]),
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
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("accountId"), args.accountId))
      .collect();
  },
});

export const getUsers = query({
  args: {
    accountToken: v.string(),
  },
  handler: async (ctx, args) => {
    const account = await ctx.runQuery(internal.account.getAccountByToken, {
      accountToken: args.accountToken,
    });
    if (!account) {
      throw new ConvexError("Account not found");
    }
    const users: Doc<"users">[] = await ctx.runQuery(internal.user.getUsersByAccountId, {
      accountId: account._id,
    });
    return users;
  },
});

export const deleteUser = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.userId);
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
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", {
      ...args.user,
      accountId: args.accountId,
    });
  },
});

export const initializeUsers = async (
  ctx: ActionCtx,
  accountId: Doc<"accounts">["_id"]
) => {
  const initialUsers = [
    {
      ...randomUser(),
      role: "CTO" as const,
    },
    ...Array.from({ length: 10 }).map(() => randomUser()),
  ];

  await Promise.all(
    initialUsers.map(async (user) => {
      const { id: clerkUserId, avatarUrl } = await createClerkUser({
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

  return;
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
  handler: async (ctx, args) => {
    const account = await ctx.runQuery(internal.account.getAccountByToken, {
      accountToken: args.accountToken,
    });
    if (!account) {
      throw new ConvexError("Account not found");
    }

    const password = randomPassword()
    const user = {
      name: args.user.name,
      email: args.user.email,
      role: args.user.role,
      updatedAt: Date.now(),
      isOnline: false,
    };
    const clerkUser = await createClerkUser({
      name: args.user.name,
      email: args.user.email,
      password: password,
    });
    await ctx.runMutation(internal.user.createUserService, {
      accountId: account._id,
      user: {
        ...user,
        clerkUserId: clerkUser.id,
        avatarUrl: clerkUser.avatarUrl,
      },
    });
    return password;
  },
});