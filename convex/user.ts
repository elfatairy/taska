import {
  ActionCtx,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { fakerEN } from "@faker-js/faker";
import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import { v } from "convex/values";
import { vUserRole } from "./schema";
import { createClerkUser } from "./services/clerk";

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

export const deleteUser = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.userId);
  },
});

export const createUser = internalMutation({
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
      const clerkUserId = await createClerkUser(user);
      await ctx.runMutation(internal.user.createUser, {
        accountId: accountId,
        user: {
          ...user,
          clerkUserId: clerkUserId,
        },
      });
    })
  );

  return;
};
