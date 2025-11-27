import { action, internalMutation, internalQuery, mutation } from "./_generated/server";
import { v } from "convex/values";
import { initializeUsers } from "./user";
import { internal } from "./_generated/api";

// TODO: Setup a CRON job to delete data after inactive 3 months

export const acountExists = internalQuery({
  args: {
    tokenIdentifier: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("accounts").filter((q) => q.eq(q.field("tokenIdentifier"), args.tokenIdentifier)).first();
  }
})

export const createAccount = internalMutation({
  args: {
    tokenIdentifier: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("accounts", {
      tokenIdentifier: args.tokenIdentifier,
      isAnonymous: true,
    });
  }
})

export const initializeAccount = action({
  args: {
    tokenIdentifier: v.string(),
  },

  handler: async (ctx, args) => {
    const accountExists = await ctx.runQuery(internal.account.acountExists, {
      tokenIdentifier: args.tokenIdentifier,
    });
    if (accountExists) {
      return;
    }

    const accountId = await ctx.runMutation(internal.account.createAccount, {
      tokenIdentifier: args.tokenIdentifier,
    });

    await initializeUsers(ctx, accountId);

    return;
  },
});

export const getAccountId = internalQuery({
  args: {
    tokenIdentifier: v.string(),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db.query("accounts").filter((q) => q.eq(q.field("tokenIdentifier"), args.tokenIdentifier)).first();
    if (!account) {
      return null;
    }
    return account._id;
  }
})