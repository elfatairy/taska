import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { ROLES } from "./utils/constants";

export const vUserRole = v.union(
  v.literal("CTO" as const),
  ...ROLES.map(role => v.literal(role)),
)

export default defineSchema({
  accounts: defineTable({
    accountToken: v.string(),
    isAnonymous: v.boolean(),
    deletedAt: v.optional(v.number()),
  }),
  users: defineTable({
    name: v.string(),
    email: v.string(),
    avatarUrl: v.string(),
    role: vUserRole,
    isOnline: v.boolean(),
    accountId: v.id("accounts"),
    updatedAt: v.number(),
    clerkUserId: v.string(),
  }),
});