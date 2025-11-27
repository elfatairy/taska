import { internalAction, internalMutation } from "@/_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { deleteClerkUser } from "@/services/clerk";

export const deleteAccount = internalAction({
  args: {
    accountId: v.id("accounts"),
  },
  handler: async (ctx, args) => {
    const users = await ctx.runQuery(internal.user.getUsersByAccountId, {
      accountId: args.accountId,
    });

    await Promise.all(users.map(async (user) => {
      await deleteClerkUser(user.clerkUserId);
      await ctx.runMutation(internal.user.deleteUser, {
        userId: user._id,
      });
    }));

    await ctx.runMutation(internal.account.delete.markAccountAsDeleted, {
      accountId: args.accountId,
    });
  },
});

export const markAccountAsDeleted = internalMutation({
  args: {
    accountId: v.id("accounts"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.accountId, {
      deletedAt: Date.now(),
    });
  },
});