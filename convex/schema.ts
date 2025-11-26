import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  accounts: defineTable({
    tokenIdentifier: v.string(),
    isAnonymous: v.boolean(),
  }),
});