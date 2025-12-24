import { internalAction, internalMutation } from "@convex/_generated/server";
import { v } from "convex/values";
import { internal } from "@convex/_generated/api";
import { deleteClerkUser } from "@convex/services/clerk";
import { Result } from "@convex/utils/types";

export const deleteAccount = internalAction({
  args: {
    accountId: v.id("accounts"),
  },
  handler: async (ctx, args) : Result<void> => {
    const { data: users } = await ctx.runQuery(internal.user.getUsersByAccountId, {
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

    return { data: undefined, error: null };
  },
});

export const markAccountAsDeleted = internalMutation({
  args: {
    accountId: v.id("accounts"),
  },
  handler: async (ctx, args) : Result<void> => {
    await ctx.db.patch(args.accountId, {
      deletedAt: Date.now(),
    });
    
    return { data: undefined, error: null };
  },
});