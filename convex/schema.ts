import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { PROJECT_STATUS, PROJECT_TYPES, ROLES } from "@convex/utils/constants";

export const vUserRole = v.union(
  v.literal("CTO" as const),
  ...ROLES.map(role => v.literal(role)),
)

export const vProjectStatus = v.union(
  ...PROJECT_STATUS.map(status => v.literal(status)),
)

export const vProjectType = v.union(
  ...PROJECT_TYPES.map(type => v.literal(type)),
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
    imageUrl: v.string(),
    role: vUserRole,
    isOnline: v.boolean(),
    accountId: v.id("accounts"),
    updatedAt: v.number(),
    clerkUserId: v.string(),
  }),
  projects: defineTable({
    name: v.string(),
    description: v.string(),
    productManagerId: v.id("users"),
    key: v.string(),
    slug: v.string(),
    status: vProjectStatus,
    start_date: v.optional(v.number()),
    target_date: v.optional(v.number()),
    completed_date: v.optional(v.number()),
    is_archived: v.boolean(),
    color: v.string(),
    type: vProjectType,
    accountId: v.id("accounts"),
    updatedAt: v.number(),
  }),
});