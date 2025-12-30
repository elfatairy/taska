import { action, internalMutation, internalQuery } from "@convex/_generated/server";
import { v } from "convex/values";
import { initializeUsers } from "@convex/user";
import { internal } from "@convex/_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { Result } from "./utils/types";
import { initializeProjects } from "./project";

// TODO: Setup a CRON job to delete data after inactive 3 months

export const getAccountByToken = internalQuery({
  args: {
    accountToken: v.string(),
  },
  handler: async (ctx, args): Result<Doc<"accounts"> | null> => {
    const account = await ctx.db.query("accounts").filter((q) => q.eq(q.field("accountToken"), args.accountToken)).first();
    return { data: account, error: null };
  }
})

export const getAccounts = internalQuery({
  handler: async (ctx): Result<Doc<"accounts">[]> => {
    const accounts = await ctx.db.query("accounts").filter((q) => q.eq(q.field("deletedAt"), undefined)).collect();
    return { data: accounts, error: null };
  }
})

export const createAccount = internalMutation({
  args: {
    accountToken: v.string(),
  },
  handler: async (ctx, args): Result<Id<"accounts">> => {
    const accountId = await ctx.db.insert("accounts", {
      accountToken: args.accountToken,
      isAnonymous: true,
    });
    return { data: accountId, error: null };
  }
})

export const initializeAccount = action({
  args: {
    accountToken: v.string(),
  },

  handler: async (ctx, args): Result<void, "UNEXPECTED_ERROR"> => {
    const getAccountByTokenResult = await ctx.runQuery(internal.account.getAccountByToken, {
      accountToken: args.accountToken,
    });
    if (getAccountByTokenResult.data) {
      return { data: undefined, error: null };
    }

    const result = await ctx.runMutation(internal.account.createAccount, {
      accountToken: args.accountToken,
    });

    await initializeUsers(ctx, result.data!);
    await initializeProjects(ctx, result.data!);
    
    return { data: undefined, error: null };
  }
})