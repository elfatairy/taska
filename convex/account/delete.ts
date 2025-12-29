import { internalAction, internalMutation } from "@convex/_generated/server";
import { v } from "convex/values";
import { internal } from "@convex/_generated/api";
import { deleteClerkUser } from "@convex/services/clerk";
import { Result } from "@convex/utils/types";

export const deleteAllAccounts = internalAction({
  handler: async (ctx): Result<void, "UNEXPECTED_ERROR"> => {
    const { data: accounts, error: accountsError } = await ctx.runQuery(internal.account.getAccounts);
    if (accountsError) return { data: null, error: accountsError };

    await Promise.all(accounts.map(async (account) => {
      const deleteAccountResult = await ctx.runAction(internal.account.delete.deleteAccount, {
        accountId: account._id,
      });
      if (deleteAccountResult.error) return { data: null, error: deleteAccountResult.error };
    }));
    return { data: undefined, error: null };
  },
});

export const deleteAccount = internalAction({
  args: {
    accountId: v.id("accounts"),
  },
  handler: async (ctx, args): Result<void, "ACCOUNT_NOT_FOUND" | "UNEXPECTED_ERROR"> => {
    const { data: users } = await ctx.runQuery(internal.user.getUsersByAccountId, {
      accountId: args.accountId,
    });

    await Promise.all(users.map(async (user) => {
      await deleteClerkUser(user.clerkUserId);
      await ctx.runMutation(internal.user.deleteUser, {
        userId: user._id,
      });
    }));

    const { data: projects, error: projectsError } = await ctx.runQuery(internal.project.getProjectsByAccountId, {
      accountId: args.accountId,
    });
    if (projectsError) return { data: null, error: projectsError };

    await Promise.all(projects.map(async (project) => {
      await ctx.runMutation(internal.project.deleteProject, {
        projectId: project._id,
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
  handler: async (ctx, args): Result<void> => {
    await ctx.db.patch(args.accountId, {
      deletedAt: Date.now(),
    });

    return { data: undefined, error: null };
  },
});