import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const vUserRole = v.union(
  v.literal("CTO"),
  v.literal("Product Manager"),
  v.literal("Frontend Developer"),
  v.literal("Backend Developer"),
  v.literal("Designer"),
  v.literal("QA"),
  v.literal("DevOps")
)

export default defineSchema({
  accounts: defineTable({
    tokenIdentifier: v.string(),
    isAnonymous: v.boolean(),
  }),
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: vUserRole,
    avatarUrl: v.string(),
    isOnline: v.boolean(),
    accountId: v.id("accounts"),
    updatedAt: v.number(),
    clerkUserId: v.string(),
  }),
});
