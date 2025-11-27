import {
  action,
  ActionCtx,
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { fakerEN } from "@faker-js/faker";
import { internal } from "./_generated/api";

import { Doc } from "./_generated/dataModel";
import { ConvexError, v } from "convex/values";
import { vUserRole } from "./schema";
type User = Doc<"users">;

const INITIAL_USERS_PASSWORD = "2<.QT8h^4-AH";

function randomUser(): Omit<User, "_id" | "_creationTime" | "accountId" | "clerkUserId"> {
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

async function createClerkUser(
  user: Omit<User, "_id" | "_creationTime" | "accountId" | "clerkUserId">
) {
  const response = await fetch("https://api.clerk.com/v1/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY!}`,
    },
    body: JSON.stringify({
      first_name: user.name.split(" ")[0],
      last_name: user.name.split(" ")[1],
      email_address: [user.email],
      password: INITIAL_USERS_PASSWORD,
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create user: ${response.statusText}`);
  }
  const clerkUser = await response.json();

  const imageResponse = await fetch(user.avatarUrl);
  if (!imageResponse.ok) {
    throw new Error(
      `Failed to fetch avatar image: ${imageResponse.statusText}`
    );
  }

  const imageBlob = await imageResponse.blob();
  const formData = new FormData();
  formData.append("file", imageBlob);

  const uploadResponse = await fetch(
    `https://api.clerk.com/v1/users/${clerkUser.id}/profile_image`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY!}`,
      },
      body: formData,
    }
  );

  if (!uploadResponse.ok) {
    throw new Error(
      `Failed to upload profile image: ${uploadResponse.statusText}`
    );
  }

  return clerkUser.id;
}

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

const voginRole = v.union(
  v.literal("Product Manager"),
  v.literal("Team Lead"),
  v.literal("Developer"),
  v.literal("CTO")
);

export const getUserByRole = internalQuery({
  args: {
    role: voginRole,
    accountId: v.string(),
  },
  handler: async (ctx, args) => {
    const accountId = await ctx.runQuery(internal.account.getAccountId, {
      tokenIdentifier: args.accountId,
    });
    if (!accountId) {
      throw new ConvexError("Account not found");
    }
    const a: Doc<"users">[] = await ctx.db
      .query("users")
      .filter(
        (q) =>
          q.eq(q.field("role"), args.role) &&
          q.eq(q.field("accountId"), accountId)
      )
      .collect();
      
    return a;
  },
});

export const loginWithRole = action({
  args: {
    role: voginRole,
    accountId: v.string(),
  },
  handler: async (ctx, args) => {
    const users = await ctx.runQuery(internal.user.getUserByRole, {
      role: args.role,
      accountId: args.accountId,
    });
    if (!users[0]) {
      throw new ConvexError("User with this role not found");
    }

    const signInTokenResponse = await fetch('https://api.clerk.com/v1/sign_in_tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY!}`
      },
      body: JSON.stringify({
        user_id: users[0].clerkUserId,
        expires_in_seconds: 2592000
      })
    })
    if (!signInTokenResponse.ok) {
      throw new Error(`Failed to create sign in token: ${signInTokenResponse.statusText}`);
    }
    const signInToken: { token: string } = await signInTokenResponse.json();
    return signInToken.token;
  },
});
