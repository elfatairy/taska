import { action, internalAction, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { initializeUsers } from "./user";
import { internal } from "./_generated/api";

// TODO: Setup a CRON job to delete data after inactive 3 months

export const getAccountByToken = internalQuery({
  args: {
    accountToken: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("accounts").filter((q) => q.eq(q.field("accountToken"), args.accountToken)).first();
  }
})

export const createAccount = internalMutation({
  args: {
    accountToken: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("accounts", {
      accountToken: args.accountToken,
      isAnonymous: true,
    });
  }
})

export const initializeAccount = action({
  args: {
    accountToken: v.string(),
  },

  handler: async (ctx, args) => {
    const accountExists = await ctx.runQuery(internal.account.getAccountByToken, {
      accountToken: args.accountToken,
    });
    if (accountExists) {
      return;
    }

    const accountId = await ctx.runMutation(internal.account.createAccount, {
      accountToken: args.accountToken,
    });

    await initializeUsers(ctx, accountId);

    return;
  },
});

export const clearAccount = internalAction({
  args: {
    accountId: v.id("accounts"),
  },
  handler: async (ctx, args) => {
    
  },
})