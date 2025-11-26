import { mutation } from "./_generated/server";
import { v } from "convex/values";

// TODO: Setup a CRON job to delete data after inactive 3 months

export const initializeAccount = mutation({
  args: {
    tokenIdentifier: v.string(),
  },

  handler: async (ctx, args) => {
    const existingAccount = await ctx.db
      .query("accounts")
      .filter((q) => q.eq(q.field("tokenIdentifier"), args.tokenIdentifier))
      .first();
    if (existingAccount) {
      return;
    }

    await ctx.db.insert("accounts", {
      tokenIdentifier: args.tokenIdentifier,
      isAnonymous: true,
    });

    return;
  },
});
